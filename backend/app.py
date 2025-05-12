import asyncio
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.websockets import WebSocketState
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Union, Any
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.hash import argon2
import os
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from pydantic import GetCoreSchemaHandler
from pydantic_core import core_schema
import pytz
import json

# MongoDB setup (global client, databases will be selected dynamically)
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URL)

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "mMZc9YSrVzHixbquDEbROVhE2VvxYgrQbJAP91UYfPk=")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 3000

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Time zone handling (Indian Standard Time)
def get_current_time():
    ist = pytz.timezone("Asia/Kolkata")
    now = datetime.now(ist)
    return now.replace(tzinfo=None)

# Pydantic ObjectId for MongoDB
class PyObjectId(str):
    @classmethod
    def __get_pydantic_core_schema__(
        cls, source_type: Any, handler: GetCoreSchemaHandler
    ) -> core_schema.CoreSchema:
        return core_schema.no_info_after_validator_function(
            cls,
            core_schema.str_schema(),
            serialization=core_schema.to_string_ser_schema(),
        )

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(v)

    def __repr__(self):
        return f"PyObjectId('{str(self)}')"

# Pydantic Models
class UserBase(BaseModel):
    name: str
    email: str
    role: str = Field(..., pattern="^(Student|Alumni|Admin)$")
    collegeId: str  # Identifies the college this user belongs to
    department: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = "offline"
    lastSeen: Optional[datetime] = None
    createdAt: Optional[datetime] = Field(default_factory=get_current_time)

    model_config = ConfigDict(arbitrary_types_allowed=True)

class UserCreate(UserBase):
    password: str  # Only required for registration

class StudentSchema(UserBase):
    prn: Optional[str] = None
    gradYear: Optional[int] = None
    degree: Optional[str] = None
    mentorshipStatus: Optional[str] = None
    skills: Optional[List[str]] = []
    academicBackground: Optional[dict] = None

class AlumniSchema(UserBase):
    prn: Optional[str] = None
    gradYear: Optional[int] = None
    degree: Optional[str] = None
    currentRole: Optional[str] = None
    mentorshipStatus: Optional[str] = None
    skills: Optional[List[str]] = []
    professionalExperience: Optional[List[dict]] = []
    achievements: Optional[List[dict]] = []

class AdminSchema(UserBase):
    permissions: List[str] = ["manage_users", "view_reports"]

class User(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    lastSeen: Optional[datetime] = None

    model_config = ConfigDict(
        json_encoders={ObjectId: str},
        populate_by_name=True
    )

class LoginSchema(BaseModel):
    email: str
    password: str
    userType: str

class MessageBase(BaseModel):
    content: str
    attachments: Optional[List[dict]] = []

class MessageCreate(MessageBase):
    receiverId: Optional[PyObjectId] = None
    groupId: Optional[PyObjectId] = None

class Message(MessageBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    senderId: PyObjectId
    receiverId: Optional[PyObjectId] = None
    groupId: Optional[PyObjectId] = None
    timestamp: datetime = Field(default_factory=get_current_time)
    isRead: bool = False

    model_config = ConfigDict(
        json_encoders={ObjectId: str},
        populate_by_name=True
    )

class GroupBase(BaseModel):
    name: str
    description: str
    type: str = Field(..., pattern="^(class|department|committee|community)$")

class GroupCreate(GroupBase):
    members: List[PyObjectId] = []

class Group(GroupBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    createdAt: datetime = Field(default_factory=get_current_time)
    createdBy: PyObjectId
    admins: List[PyObjectId] = []
    members: List[PyObjectId] = []
    imageUrl: Optional[str] = None

    model_config = ConfigDict(
        json_encoders={ObjectId: str},
        populate_by_name=True
    )

class CollegeCreate(BaseModel):
    collegeId: str = Field(..., description="Unique identifier for the college")
    collegeName: str = Field(..., description="Official name of the college")
    password: str = Field(..., description="Password for college admin login")
    location: Optional[str] = Field(None, description="Physical location/address of the college")
    established: Optional[int] = Field(None, description="Year the college was established", ge=1800, le=datetime.now().year)
    website: Optional[str] = Field(None, description="Official website URL of the college", pattern=r'^https?://.*')
    email: Optional[str] = Field(None, description="Official contact email of the college")
    phone: Optional[str] = Field(None, description="Contact phone number of the college")
    description: Optional[str] = Field(None, description="Brief description about the college")
    logo_url: Optional[str] = Field(None, description="URL to the college logo image")
    departments: Optional[List[str]] = Field(None, description="List of departments in the college")
    accreditation: Optional[str] = Field(None, description="Accreditation details of the college")
    social_media: Optional[dict] = Field(None, description="Social media handles of the college")
    status: Optional[str] = Field("pending", description="Approval status of the college", pattern="^(pending|approved|rejected)$")
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "collegeId": "COEP",
                "collegeName": "College of Engineering, Pune",
                "password": "securepassword",
                "location": "Pune, Maharashtra, India",
                "established": 1854,
                "website": "https://www.coep.org.in",
                "email": "contact@coep.org.in",
                "phone": "+91-020-25507000",
                "description": "One of the oldest engineering colleges in Asia",
                "logo_url": "https://example.com/coep_logo.png",
                "departments": ["Computer Engineering", "Mechanical Engineering", "Civil Engineering"],
                "accreditation": "NAAC A++ Grade",
                "social_media": {"facebook": "coepofficial", "twitter": "coep_official", "linkedin": "coep"},
            
            "compulsary": [
                "collegeId",
                "collegeName",
                "password"
            ],
            }
        }
    )

# Utility Functions
def verify_password(plain_password, hashed_password):
    return argon2.verify(plain_password, hashed_password)

def get_password_hash(password):
    return argon2.hash(password)

def create_access_token(user: dict, expires_delta: timedelta):
    to_encode = {
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "collegeId": user["collegeId"]  # Include collegeId in the token
    }
    expire = get_current_time() + expires_delta
    to_encode["exp"] = int(expire.timestamp())
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("email")
        college_id: str = payload.get("collegeId")
        if email is None or college_id is None:
            raise credentials_exception
        token_data = {"email": email, "collegeId": college_id}
    except JWTError:
        raise credentials_exception

    # Fetch the college's database name from the global SaaS_Management database
    saas_db = client["SaaS_Management"]
    college = await saas_db.colleges.find_one({"collegeId": college_id})
    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    # Connect to the college's database
    college_db = client[college["databaseName"]]
    user = await college_db[payload.get("role")].find_one({"email": token_data["email"]})
    if user is None:
        raise credentials_exception
    user["collegeDb"] = college_db  # Attach the database to the user object for later use
    del user["password"]
    return user

# FastAPI App
app = FastAPI()

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="AlumniConnect SaaS API",
        version="1.0.0",
        description="A multi-tenant chat application for alumni, students, and admins across multiple colleges.",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
    }
    for path, methods in openapi_schema["paths"].items():
        for method in methods:
            if (
                (path == "/colleges/" and method.lower() == "get")
                or (path == "/your/post/endpoint" and method.lower() == "post")
                or (path in [
                    "/users/me",
                    "/users/{user_id}",
                    "/users/",
                    "/messages/",
                    "/groups/",
                    "/groups/{group_id}",
                    "/groups/{group_id}/members"
                ])
            ):
                methods[method]["security"] = [{"BearerAuth": []}]

    app.openapi_schema = openapi_schema
    return openapi_schema

app.openapi = custom_openapi

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str, college_id: str):
        key = f"{college_id}:{user_id}"
        try:
            if websocket.client_state == WebSocketState.CONNECTING:  # Ensure WebSocket is still connecting
                await websocket.accept()
            self.active_connections[key] = websocket
        except Exception as e:
            print(f"WebSocket connection error: {e}")
        

    def disconnect(self, user_id: str, college_id: str):
        key = f"{college_id}:{user_id}"
        if key in self.active_connections:
            del self.active_connections[key]

    async def send_personal_message(self, message: str, user_id: str, college_id: str):
        key = f"{college_id}:{user_id}"
        if key in self.active_connections:
            await self.active_connections[key].send_text(message)

    async def broadcast_to_group(self, message: str, group_id: str, college_id: str, college_db, exclude_user_id: str = None):
        if not group_id:
            # If no group_id is provided, broadcast to all users in the college
            for key in self.active_connections:
                if key.startswith(f"{college_id}:") and not key.endswith(f":{exclude_user_id}"):
                    try:
                        await self.active_connections[key].send_text(message)
                    except Exception as e:
                        print(f"Error broadcasting to {key}: {e}")
            return
            
        group = await college_db.groups.find_one({"_id": ObjectId(group_id)})
        if not group:
            print(f"Group {group_id} not found")
            return
    
        members = group["members"]
        print(f"Broadcasting to group {group_id} with members {members}")
        for member_id in members:
            member_id_str = str(member_id)
            if member_id_str == exclude_user_id:
                continue  # Skip the sender
            key = f"{college_id}:{member_id_str}"
            if key in self.active_connections:
                try:
                    await self.active_connections[key].send_text(message)
                    print(f"Sent group message to {member_id_str}: {message}")
                except Exception as e:
                    print(f"Error sending to {member_id_str}: {e}")
            else:
                print(f"Member {member_id_str} not connected in college {college_id}")

manager = ConnectionManager()

# API Endpoints
@app.post("/colleges/")
async def create_college(college: CollegeCreate):
    saas_db = client["SaaS_Management"]
    existing_college = await saas_db.colleges.find_one({"collegeId": college.collegeId})
      # Print the existing college objec
    if existing_college:
        raise HTTPException(status_code=400, detail="College already exists")
    existing_college_name = await saas_db.colleges.find_one({"collegeName": college.collegeName})
    if existing_college_name:
        raise HTTPException(status_code=400, detail="College Name already exists")
    database_name = f"{college.collegeId}_AlumniConnect"
    
    # Convert Pydantic model to dict and add additional fields
    college_dict = college.dict(exclude_none=True)
    college_dict["databaseName"] = database_name
    college_dict["createdAt"] = get_current_time()
    college_dict["status"] = "pending"
    
    # Hash the password before storing
    college_dict["password"] = get_password_hash(college_dict["password"])
    
    await saas_db.colleges.insert_one(college_dict)

    return {"status": "success", "message": f"College {college.collegeName} registration request submitted and pending approval."}

@app.post("/login")
async def login(credentials: LoginSchema, collegeId: str):
    saas_db = client["SaaS_Management"]
    college = await saas_db["colleges"].find_one({"collegeId": collegeId})
    print(college)
    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    college_db = client[college["databaseName"]]
    user = await college_db[credentials.userType].find_one({"email": credentials.email})
    if not user:
        raise HTTPException(status_code=400, detail="User not found")
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    await college_db[credentials.userType].update_one(
        {"_id": user["_id"]},
        {"$set": {"lastSeen": get_current_time(), "status": "online"}}
    )
    user["_id"] = str(user["_id"])
    token = create_access_token(user, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    del user["password"]
    return {"token": token, "user_info": user}

@app.post("/register")
async def register(user: UserCreate, collegeId: str):
    saas_db = client["SaaS_Management"]
    college = await saas_db["colleges"].find_one({"collegeId": collegeId})
    if not college:
        raise HTTPException(status_code=404, detail="College not found")

    college_db = client[college["databaseName"]]
    role = user.role
    if role not in ["Student", "Alumni", "Admin"]:
        raise HTTPException(status_code=400, detail="Invalid role specified")

    existing_user = await college_db[role].find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_dict = user.dict()
    user_dict["collegeId"] = collegeId  # Ensure collegeId is set
    if role == "Student":
        user_schema = StudentSchema(**user_dict)
    elif role == "Alumni":
        user_schema = AlumniSchema(**user_dict)
    elif role == "Admin":
        user_schema = AdminSchema(**user_dict)

    user_dict = user_schema.dict()
    user_dict["password"] = get_password_hash(user.password)
    user_dict["lastSeen"] = get_current_time()

    result = await college_db[role].insert_one(user_dict)
    new_user = await college_db[role].find_one({"_id": result.inserted_id})
    new_user["_id"] = str(new_user["_id"])
    del new_user["password"]
    return new_user

@app.get("/users/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    current_user["_id"] = str(current_user["_id"])
    del current_user["collegeDb"]
    return current_user


@app.get("/users/{user_id}")
async def get_user_profile(user_id: str, current_user: dict = Depends(get_current_user)):
    """
    Fetch profile details of another user by their ID.
    The user_id must be a valid ObjectId.
    """
    college_db = current_user["collegeDb"]
    
    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID format")
    
    search_tasks = []
    roles = ["Student", "Alumni", "Admin"]

    for role in roles:
        search_tasks.append(college_db[role].find_one({"_id": ObjectId(user_id)}))
    
    results = await asyncio.gather(*search_tasks)
    
    user = next((result for result in results if result is not None), None)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if "password" in user:
        del user["password"]
    user["_id"] = str(user["_id"])
    return user

@app.get("/users/")
async def read_users(skip: int = 0, limit: int = 100, current_user: dict = Depends(get_current_user)):
    college_db = current_user["collegeDb"]
    users = []
    for role in ["Student", "Alumni", "Admin"]:
        async for user in college_db[role].find().skip(skip).limit(limit):
            user["_id"] = str(user["_id"])
            del user["password"]
            users.append(user)
    return users

@app.post("/messages/")
async def create_message(message: MessageCreate, current_user: dict = Depends(get_current_user)):
    college_db = current_user["collegeDb"]
    message_dict = message.dict()
    message_dict["senderId"] = ObjectId(current_user["_id"])
    if message_dict["receiverId"]:
        message_dict["receiverId"] = ObjectId(message_dict["receiverId"])
        receiver = await college_db[current_user["role"]].find_one({"_id": message_dict["receiverId"]})
        if not receiver:
            raise HTTPException(status_code=404, detail="Receiver not found")
    if message_dict["groupId"]:
        message_dict["groupId"] = ObjectId(message_dict["groupId"])
        group = await college_db.groups.find_one({"_id": message_dict["groupId"]})
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
    message_dict["timestamp"] = get_current_time()
    message_dict["isRead"] = False

    result = await college_db.messages.insert_one(message_dict)
    new_message = await college_db.messages.find_one({"_id": result.inserted_id})
    new_message["_id"] = str(new_message["_id"])
    new_message["senderId"] = str(new_message["senderId"])
    if new_message.get("receiverId"):
        new_message["receiverId"] = str(new_message["receiverId"])
    if new_message.get("groupId"):
        new_message["groupId"] = str(new_message["groupId"])
    return new_message

@app.get("/messages/")
async def read_messages(
    receiver_id: Optional[str] = None,
    group_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
):
    college_db = current_user["collegeDb"]
    
    query = {}
    if receiver_id:
        query["$or"] = [
            {"senderId": ObjectId(current_user["_id"]), "receiverId": ObjectId(receiver_id)},
            {"senderId": ObjectId(receiver_id), "receiverId": ObjectId(current_user["_id"])}
        ]
        
    elif group_id:
        query["groupId"] = ObjectId(group_id)
        print(ObjectId(group_id))
        count = await college_db["messages"].find_one({'groupId': ObjectId('67e80be166b4381a3ba6812c')})
        print(f"Messages found: {count}")
        print(query)
    else:
        query["$or"] = [
            {"receiverId": ObjectId(current_user["_id"])},
            {"senderId": ObjectId(current_user["_id"])}
        ]
    cursor = college_db["messages"].find(query).sort("timestamp", -1).skip(skip).limit(limit)
    messages = await cursor.to_list(length=None)
    
    messages = []
    async for message in college_db["messages"].find(query).sort("timestamp", -1).skip(skip).limit(limit):
        message["_id"] = str(message["_id"])
        message["senderId"] = str(message["senderId"])
        if message.get("receiverId"):
            message["receiverId"] = str(message["receiverId"])
        if message.get("groupId"):
            message["groupId"] = str(message["groupId"])
        messages.append(message)
        
    return messages

@app.post("/groups/")
async def create_group(group: GroupCreate, current_user: dict = Depends(get_current_user)):
    college_db = current_user["collegeDb"]

    group_dict = group.dict()
    group_dict["createdAt"] = get_current_time()
    group_dict["createdBy"] = ObjectId(current_user["_id"])
    group_dict["admins"] = [ObjectId(current_user["_id"])]
    group_dict["members"] = [ObjectId(current_user["_id"])] + [ObjectId(m) for m in group_dict["members"]]

    result = await college_db.groups.insert_one(group_dict)
    new_group = await college_db.groups.find_one({"_id": result.inserted_id})
    new_group["_id"] = str(new_group["_id"])
    new_group["createdBy"] = str(new_group["createdBy"])
    new_group["admins"] = [str(a) for a in new_group["admins"]]
    new_group["members"] = [str(m) for m in new_group["members"]]
    return new_group

@app.get("/groups/")
async def read_groups(skip: int = 0, limit: int = 100, current_user: dict = Depends(get_current_user)):
    college_db = current_user["collegeDb"]
    groups = []
    async for group in college_db.groups.find({
        "members": ObjectId(current_user["_id"])
    }).skip(skip).limit(limit):
        group["_id"] = str(group["_id"])
        group["createdBy"] = str(group["createdBy"])
        group["admins"] = [str(a) for a in group["admins"]]
        group["members"] = [str(m) for m in group["members"]]
        groups.append(group)
    return groups

@app.get("/groups/{group_id}")
async def read_group(group_id: str, current_user: dict = Depends(get_current_user)):
    college_db = current_user["collegeDb"]
    group = await college_db.groups.find_one({
        "_id": ObjectId(group_id),
        "members": ObjectId(current_user["_id"])
    })
    if not group:
        raise HTTPException(status_code=404, detail="Group not found or access denied")

    group["_id"] = str(group["_id"])
    group["createdBy"] = str(group["createdBy"])
    group["admins"] = [str(a) for a in group["admins"]]
    group["members"] = [str(m) for m in group["members"]]
    return group

@app.post("/groups/{group_id}/members")
async def add_group_member(group_id: str, member_id: str, current_user: dict = Depends(get_current_user)):
    college_db = current_user["collegeDb"]
    group = await college_db.groups.find_one({
        "_id": ObjectId(group_id),
        "admins": ObjectId(current_user["_id"])
    })
    if not group:
        raise HTTPException(status_code=403, detail="Only group admins can add members")

    await college_db.groups.update_one(
        {"_id": ObjectId(group_id)},
        {"$addToSet": {"members": ObjectId(member_id)}}
    )
    return {"status": "success", "message": "Member added to group"}
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str, token: str = None):
    try:
        # Verify token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("email")
        college_id = payload.get("collegeId")
        if not email or not college_id:
            await websocket.close(code=1008)
            return

        # Get the college database
        saas_db = client["SaaS_Management"]
        college = await saas_db.colleges.find_one({"collegeId": college_id})
        if not college:
            await websocket.close(code=1008)
            return
        
        college_db = client[college["databaseName"]]
        
        await manager.connect(websocket, user_id, college_id)
        try:
            while True:
                data = await websocket.receive_text()
                message_data = json.loads(data)
                
                # Handle different message types
                if message_data["type"] == "message":
                    # Save to database
                    message = {
                        "content": message_data["content"],
                        "senderId": ObjectId(user_id),
                        "receiverId": ObjectId(message_data["receiverId"]),
                        "timestamp": get_current_time(),
                        "isRead": False
                    }
                    result = await college_db.messages.insert_one(message)
                    
                    # Get the inserted message with string IDs for sending
                    new_message = await college_db.messages.find_one({"_id": result.inserted_id})
                    print(new_message["timestamp"].astimezone(pytz.timezone("Asia/Kolkata")).isoformat())
                    message_to_send = {
                        "_id": str(new_message["_id"]),
                        "content": new_message["content"],
                        "senderId": str(new_message["senderId"]),
                        "receiverId": str(new_message["receiverId"]),
                        "timestamp": new_message["timestamp"].astimezone(pytz.timezone("Asia/Kolkata")).isoformat(),
                        "isRead": new_message["isRead"]
                    }
                    
                    # Broadcast to receiver
                    await manager.send_personal_message(
                        json.dumps({
                            "type": "message",
                            "data": message_to_send
                        }),
                        message_data["receiverId"],
                        college_id
                    )
                    
                    # Also send back to sender for UI update
                    await manager.send_personal_message(
                        json.dumps({
                            "type": "message",
                            "data": message_to_send
                        }),
                        user_id,
                        college_id
                    )

                elif message_data["type"] == "group_message":
                    # Verify senderName matches JWT payload (optional security check)
                    if message_data.get("senderName") != payload.get("name"):
                        message_data["senderName"] = payload.get("name")  # Override with verified name

                    # Save to database
                    message = {
                        "content": message_data["content"],
                        "senderId": ObjectId(user_id),
                        "groupId": ObjectId(message_data["groupId"]),
                        "timestamp": get_current_time(),
                        "isRead": False
                    }
                    result = await college_db.messages.insert_one(message)

                    # Get the inserted message with string IDs for sending
                    new_message = await college_db.messages.find_one({"_id": result.inserted_id})
                    print(new_message["timestamp"].astimezone(pytz.timezone("Asia/Kolkata")).isoformat())
                    message_to_send = {
                        "_id": str(new_message["_id"]),
                        "content": new_message["content"],
                        "senderId": str(new_message["senderId"]),
                        "groupId": str(new_message["groupId"]),
                        "senderName": message_data.get("senderName", "Unknown"),
                        "timestamp": new_message["timestamp"].astimezone(pytz.timezone("Asia/Kolkata")).isoformat(),
                        "isRead": new_message["isRead"]
                    }

                    # Broadcast to group members
                    await manager.broadcast_to_group(
                        json.dumps({
                            "type": "group_message",
                            "data": message_to_send
                        }),
                        message_data["groupId"],
                        college_id,
                        college_db
                    )

        except WebSocketDisconnect:
            manager.disconnect(user_id, college_id)
            # Update user status to offline
            role = payload.get("role")
            if role:
                await college_db[role].update_one(
                    {"_id": ObjectId(user_id)},
                    {"$set": {"status": "offline", "lastSeen": get_current_time()}}
                )
                
                # Notify others about user going offline
                for connection_key in list(manager.active_connections.keys()):
                    if connection_key.startswith(f"{college_id}:") and not connection_key.endswith(f":{user_id}"):
                        try:
                            await manager.active_connections[connection_key].send_text(
                                json.dumps({
                                    "type": "user_offline",
                                    "userId": user_id
                                })
                            )
                        except Exception as e:
                            print(f"Error notifying about offline status: {e}")
                            
    except JWTError:
        await websocket.close(code=1008)
    except Exception as e:
        print(f"WebSocket error: {e}")
        try:
            manager.disconnect(user_id, college_id)
            await websocket.close(code=1011)
        except:
            pass


@app.get("/colleges/")
async def get_colleges(status: str = None, search: str = None, skip: int = 0, limit: int = 100, current_user: dict = Depends(get_current_user)):
    # Only allow superadmin (global admin) to access this endpoint
    
    
    if current_user["role"] != "Student" :
        raise HTTPException(status_code=403, detail="Not authorized to view colleges.")
    saas_db = client["SaaS_Management"]
    query = {}
    if status:
        query["status"] = status
    if search:
        query["collegeName"] = {"$regex": search, "$options": "i"}
    cursor = saas_db.colleges.find(query).skip(skip).limit(limit)
    colleges = []
    async for college in cursor:
        college["_id"] = str(college["_id"])
        colleges.append(college)
    return {"colleges": colleges}
    
    
@app.post("/colleges/{college_id}/approve")
async def approve_college(college_id: str):
    saas_db = client["SaaS_Management"]
    college = await saas_db.colleges.find_one({"collegeId": college_id})
    if not college:
        raise HTTPException(status_code=404, detail="College not found")
    if college.get("status") == "approved":
        return {"status": "already_approved", "message": f"College {college['collegeName']} is already approved."}
    if college.get("status") == "rejected":
        raise HTTPException(status_code=400, detail="College has been rejected and cannot be approved.")
    # Update status to approved
    await saas_db.colleges.update_one({"collegeId": college_id}, {"$set": {"status": "approved"}})
    database_name = college["databaseName"]
    college_db = client[database_name]
    # Create collections if not already present
    existing_collections = await college_db.list_collection_names()
    collections_to_create = ["groups", "messages", "userchats", "Admin", "Alumni", "Student"]
    for coll in collections_to_create:
        if coll not in existing_collections:
            await college_db.create_collection(coll)
    # Add indexes for performance
    await college_db["messages"].create_index([("senderId", 1), ("receiverId", 1), ("timestamp", -1)])
    await college_db["messages"].create_index([("groupId", 1), ("timestamp", -1)])
    await college_db["groups"].create_index([("members", 1)])
    return {"status": "success", "message": f"College {college['collegeName']} approved and collections created."}


class CollegeLogin(BaseModel):
    collegeId: str
    password: str

@app.post("/college-login")
async def college_login(credentials: CollegeLogin):
    saas_db = client["SaaS_Management"]
    college = await saas_db["colleges"].find_one({"collegeId": credentials.collegeId})
    if not college:
        raise HTTPException(status_code=404, detail="College not found")
    
    # Check if college has a password field and verify it
    if "password" not in college or not verify_password(credentials.password, college["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Check if college is approved
    if college.get("status") != "approved":
        raise HTTPException(status_code=403, detail="College account is not approved yet")
    
    # Create a token for the college
    token_data = {
        "collegeId": college["collegeId"],
        "collegeName": college["collegeName"],
        "role": "college"
    }
    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    
    return {"token": token, "college_info": {
        "collegeId": college["collegeId"],
        "collegeName": college["collegeName"],
        "status": college["status"],
        "databaseName": college["databaseName"]
    }}
    