import asyncio
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect , Response, Request
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
from fastapi.openapi.docs import get_swagger_ui_html
import pytz
import json
import secrets
from fastapi import Body
from fastapi import UploadFile, File
from fastapi.responses import StreamingResponse
import pandas as pd
import random
import io
from dotenv import load_dotenv

load_dotenv()

# MongoDB setup (global client, databases will be selected dynamically)
MONGODB_URL = os.getenv("MONGODB_URL")
client = AsyncIOMotorClient(MONGODB_URL)

# Security
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30000

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
    role: str = Field("anonymous", pattern="^(Student|Alumni|Admin)$")
    collegeId: Optional[str] = None  # Identifies the college this user belongs to
    department: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = "offline"
    lastSeen: Optional[datetime] = None
    createdAt: Optional[datetime] = Field(default_factory=get_current_time)

    model_config = ConfigDict(arbitrary_types_allowed=True)

class CollegeMeta(BaseModel):
    total_students: int = 0
    total_alumni: int = 0
    total_achievements: int = 0
    total_donations: float = 0
    donations_growth_percent: float = 0
    achievements_growth_percent: float = 0
    active_groups: int = 0
    upcoming_events: int = 0
    recent_achievements: int = 0
    recent_donations: float = 0
    last_updated: datetime = Field(default_factory=get_current_time)

    model_config = ConfigDict(
        json_encoders={ObjectId: str},
        populate_by_name=True
    )

class UserCreate(UserBase):
    password: str  # Only required for registration

class StudentSchema(UserBase):
    rollno: Optional[str] = None
    contact_number : Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    description: Optional[str] = None
    prn: Optional[str] = None
    gradYear: Optional[int] = None
    degree: Optional[str] = None
    mentorshipStatus: Optional[str] = None
    skills: Optional[List[str]] = []
    Experience: Optional[dict] = None

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
 
class AdminCreate(AdminSchema):
    password: str  # Only required for registration 

class User(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    lastSeen: Optional[datetime] = None

    model_config = ConfigDict(
        json_encoders={ObjectId: str},
        populate_by_name=True
    )

class LoginSchema(BaseModel):
    collegeId: str
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

class College(BaseModel):
    collegeId: str = Field(..., description="Unique identifier for the college")
    collegeName: str = Field(..., description="Official name of the college")
    email: str = Field(..., description="Official contact email of the college")
    location: Optional[str] = Field(None, description="Physical location/address of the college")
    established: Optional[int] = Field(None, description="Year the college was established", ge=1800, le=datetime.now().year)
    website: Optional[str] = Field(None, description="Official website URL of the college", pattern=r'^https?://.*')
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

class CollegeRegistrationRequest(BaseModel):
    college: College
    admin_password: str = Field(..., description="Password for college admin login")

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

from fastapi import Request, Header, HTTPException, status

async def verify_csrf(
    request: Request,
    csrf_header: str = Header(..., alias="X-CSRF-Token")
):
    csrf_cookie = request.cookies.get("csrf_token")

    if not csrf_cookie or csrf_cookie != csrf_header:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token invalid or missing"
        )



async def get_token_from_cookie(request: Request) -> str:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return token

async def get_current_user(token: str = Depends(get_token_from_cookie)):
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
    SaaS_Management = client["SaaS_Management"]
    college = await SaaS_Management.colleges.find_one({"collegeId": college_id})
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
    # Define a set of (path, method) tuples that require BearerAuth
    protected_endpoints = {
        ("/colleges/", "get"),
        ("/bulk-register-students/", "post"),
        ("/bulk-register-alumni/", "post"),
        ("/admins/", "post"),
        ("/users/me", "get"),
        ("/users/{user_id}", "get"),
        ("/users/", "get"),
        ("/messages/", "post"),
        ("/messages/", "get"),
        ("/groups/", "post"),
        ("/groups/", "get"),
        ("/admins/", "get"),
        ("/add-admin/", "post"),
        ("/admins/{admin_id}", "delete"),
        ("/groups/{group_id}", "get"),
        ("/groups/{group_id}/members", "post"),
        ("/achievements/", "post"),
        ("/students/","get"),
    }
    for path, methods in openapi_schema["paths"].items():
        for method in methods:
            if (path, method.lower()) in protected_endpoints:
                methods[method]["security"] = [{"BearerAuth": []}]

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi


# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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

async def initialize_college_meta(college_db):
    """Initialize the meta collection for a new college"""
    meta = CollegeMeta().dict()
    await college_db["meta"].insert_one(meta)
    return meta

@app.post("/colleges/")
async def create_college(request: CollegeRegistrationRequest):
    SaaS_Management = client["SaaS_Management"]
    college = request.college
    admin_password = request.admin_password

    existing_college = await SaaS_Management.colleges.find_one({"collegeId": college.collegeId})
    if existing_college:
        raise HTTPException(status_code=400, detail="College already exists")
    existing_college_name = await SaaS_Management.colleges.find_one({"collegeName": college.collegeName})
    if existing_college_name:
        raise HTTPException(status_code=400, detail="College Name already exists")
    database_name = f"{college.collegeId}_AlumniConnect"

    # Prepare college dict (no password)
    college_dict = college.dict(exclude_none=True)
    college_dict["databaseName"] = database_name
    college_dict["status"] = "pending"
    # Do NOT store password in college_dict

    await SaaS_Management.colleges.insert_one(college_dict)

    # Create the admin user in the college's database using college details
    college_db = client[database_name]
    admin_obj = AdminCreate(
        name=college.collegeId,
        email=college.email,
        role="Admin",
        collegeId=college.collegeId,
        password=admin_password
    )
    admin_dict = admin_obj.dict(exclude_none=True)
    admin_dict["password"] = get_password_hash(admin_dict["password"])
    await college_db["Admin"].insert_one(admin_dict)
    
    # Initialize meta collection
    await initialize_college_meta(college_db)

    return {"status": "success", "message": f"College {college.collegeName} registration request submitted and pending approval."}




@app.post("/login")
async def login(credentials: LoginSchema, response: Response):
    SaaS_Management = client["SaaS_Management"]
    college = await SaaS_Management["colleges"].find_one({"collegeId": credentials.collegeId})
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

    # Generate a secure random CSRF token
    csrf_token = secrets.token_urlsafe(32)

    # Set the JWT as HttpOnly, Secure cookie
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,         # Set True in production
        samesite="Strict",   # Or "Lax" depending on your needs
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/"
    )

    # Set CSRF token cookie (readable by JS, so no httponly)
    response.set_cookie(
        key="csrf_token",
        value=csrf_token,
        httponly=False,
        secure=True,
        samesite="Strict",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/"
    )
    
    # Also return CSRF token in JSON response for frontend to read and send as header
    return {
        "user_info": user,
        "userId": str(user["_id"]),
        "csrf_token": csrf_token
    }


async def update_college_meta(college_db, update_type, count=1):
    """Update meta collection statistics"""
    meta = await college_db["meta"].find_one({})
    if not meta:
        meta = await initialize_college_meta(college_db)
    
    updates = {}
    current_time = get_current_time()
    current_month = current_time.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    if update_type == "student":
        updates["total_students"] = meta["total_students"] + count
    elif update_type == "alumni":
        updates["total_alumni"] = meta["total_alumni"] + count
    elif update_type == "achievement":
        updates["total_achievements"] = meta["total_achievements"] + count
        updates["recent_achievements"] = meta.get("recent_achievements", 0) + count
        
        # Calculate growth percentage
        last_month = (current_month.replace(day=1) - timedelta(days=1)).replace(day=1)
        last_month_achievements = await college_db["achievements"].count_documents({
            "createdAt": {"$gte": last_month, "$lt": current_month}
        })
        current_month_achievements = await college_db["achievements"].count_documents({
            "createdAt": {"$gte": current_month}
        })
        
        if last_month_achievements > 0:
            growth = ((current_month_achievements - last_month_achievements) / last_month_achievements) * 100
            updates["achievements_growth_percent"] = growth
    elif update_type == "donation":
        amount = count  # In this case, count is the donation amount
        updates["total_donations"] = meta["total_donations"] + amount
        updates["recent_donations"] = meta.get("recent_donations", 0) + amount
        
        # Calculate growth percentage
        last_month = (current_month.replace(day=1) - timedelta(days=1)).replace(day=1)
        last_month_donations = await college_db["donations"].aggregate([
            {"$match": {"createdAt": {"$gte": last_month, "$lt": current_month}}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]).to_list(length=1)
        
        current_month_donations = await college_db["donations"].aggregate([
            {"$match": {"createdAt": {"$gte": current_month}}},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]).to_list(length=1)
        
        last_month_total = last_month_donations[0]["total"] if last_month_donations else 0
        current_month_total = current_month_donations[0]["total"] if current_month_donations else 0
        
        if last_month_total > 0:
            growth = ((current_month_total - last_month_total) / last_month_total) * 100
            updates["donations_growth_percent"] = growth
    elif update_type == "group":
        updates["active_groups"] = await college_db["groups"].count_documents({"status": "active"})
    elif update_type == "event":
        updates["upcoming_events"] = await college_db["events"].count_documents({
            "eventDate": {"$gte": current_time}
        })
    
    updates["last_updated"] = current_time
    
    await college_db["meta"].update_one({}, {"$set": updates})

from fastapi import APIRouter, HTTPException, Response
from pydantic import BaseModel
import secrets

class SuperAdminLoginSchema(BaseModel):
    username: str
    password: str

@app.post("/superadmin/login")
async def superadmin_login(credentials: SuperAdminLoginSchema, response: Response):
    db = client["SaaS_Management"]
    superadmin = await db["SuperAdmin"].find_one({"username": credentials.username})
    if not superadmin:
        raise HTTPException(status_code=400, detail="Superadmin not found")
    if not verify_password(credentials.password, superadmin["password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Prepare user info for token
    user_info = {
        "_id": str(superadmin["_id"]),
        "username": superadmin["username"],
        "role": "superadmin"
    }
    token = create_access_token(user_info, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    csrf_token = secrets.token_urlsafe(32)

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="Strict",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/"
    )
    response.set_cookie(
        key="csrf_token",
        value=csrf_token,
        httponly=False,
        secure=True,
        samesite="Strict",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/"
    )
    return {
        "user_info": user_info,
        "csrf_token": csrf_token
    }    

@app.post("/register")
async def register(user: UserCreate, collegeId: str):
    SaaS_Management = client["SaaS_Management"]
    college = await SaaS_Management["colleges"].find_one({"collegeId": collegeId})
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
    
    # Update meta collection
    if role == "Student":
        await update_college_meta(college_db, "student")
    elif role == "Alumni":
        await update_college_meta(college_db, "alumni")
    
    new_user = await college_db[role].find_one({"_id": result.inserted_id})
    new_user["_id"] = str(new_user["_id"])
    del new_user["password"]
    return new_user

@app.get("/users/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    current_user["_id"] = str(current_user["_id"])
    del current_user["collegeDb"]
    return current_user

@app.post("/users/me/skills")
async def update_skill(current_user: dict = Depends(get_current_user), skill: dict = Body(...), _: str = Depends(verify_csrf)):
    # skill: {"skill": "new_skill"}
    print(skill)
    SaaS_Management = client["SaaS_Management"]
    college = await SaaS_Management["colleges"].find_one({"collegeId": current_user["collegeId"]})
    college_db = client[college["databaseName"]]
    new_skill = skill.get("skill")
    if not new_skill or not isinstance(new_skill, str):
        raise HTTPException(status_code=400, detail="Invalid skill data")

    # Determine user collection based on role
    user_collection = None
    if current_user["role"] == "Student":
        user_collection = college_db.Student
    elif current_user["role"] == "Alumni":
        user_collection = college_db.Alumni
    else:
        raise HTTPException(status_code=403, detail="Only students or alumni can update skills")
    print(current_user["email"])
    # Add skill if not already present
    result = await user_collection.update_one(
        {"email": current_user["email"]},
        {"$addToSet": {"skills": new_skill}}
    )
    print(result)
    return {"message": "Skill added successfully"}

    
@app.put("/users/me")
async def update_user_profile(current_user: dict = Depends(get_current_user), profile_data: dict = Body(...), _: str = Depends(verify_csrf)):
    # Update user profile information
    SaaS_Management = client["SaaS_Management"]
    college = await SaaS_Management["colleges"].find_one({"collegeId": current_user["collegeId"]})
    college_db = client[college["databaseName"]]
    
    # Determine user collection based on role
    if current_user["role"] == "Student":
        user_collection = college_db.Student
    elif current_user["role"] == "Alumni":
        user_collection = college_db.Alumni
    else:
        raise HTTPException(status_code=403, detail="Only students or alumni can update their profile")
    
    # Fields that can be updated
    allowed_fields = ["name", "department"]
    update_data = {}
    
    for field in allowed_fields:
        if field in profile_data and profile_data[field]:
            update_data[field] = profile_data[field]
    
    # Handle gradYear separately (it's called graduationYear in frontend)
    if "graduationYear" in profile_data and profile_data["graduationYear"]:
        try:
            grad_year = int(profile_data["graduationYear"])
            update_data["gradYear"] = grad_year
        except (ValueError, TypeError):
            pass
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    
    # Update the user document
    result = await user_collection.update_one(
        {"email": current_user["email"]},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Profile update failed")
    
    # Fetch and return the updated user document
    updated_user = await user_collection.find_one({"email": current_user["email"]})
    updated_user["_id"] = str(updated_user["_id"])
    if "password" in updated_user:
        del updated_user["password"]
    
    return updated_user

@app.post("/users/me/experience")
async def update_experience(current_user: dict = Depends(get_current_user), experience: dict = Body(...), _: str = Depends(verify_csrf)):
    # Handle both direct experience object and wrapped experience object
    SaaS_Management = client["SaaS_Management"]
    college = await SaaS_Management["colleges"].find_one({"collegeId": current_user["collegeId"]})
    college_db = client[college["databaseName"]]
    
    # Check if the experience is wrapped in an 'experience' field or sent directly
    new_experience = experience.get("experience") if "experience" in experience else experience
    
    if not new_experience or not isinstance(new_experience, dict):
        raise HTTPException(status_code=400, detail="Invalid experience data")

    if current_user["role"] == "Student":
        user_collection = college_db.Student
        update_field = "Experience"
    elif current_user["role"] == "Alumni":
        user_collection = college_db.Alumni
        update_field = "professionalExperience"
    else:
        raise HTTPException(status_code=403, detail="Only students or alumni can update experience")

    result = await user_collection.update_one(
        {"email": current_user["email"]},
        {"$addToSet": {update_field: new_experience}}
    )
    
    # Return the experience data that was added
    return new_experience

@app.get("/users/{user_id}")
async def get_user_profile(user_id: str, current_user: dict = Depends(get_current_user),_: str = Depends(verify_csrf)):
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
    # Only allow admins to create groups
    if current_user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Only admins can create groups")
        
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
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    try:
        # Extract token from cookies
        cookies = websocket.cookies
        token = cookies.get("access_token")
        if not token:
            await websocket.close(code=1008, reason="No access token found")
            return
            
        # Verify token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("email")
        college_id = payload.get("collegeId")
        if not email or not college_id:
            await websocket.close(code=1008)
            return

        # Get the college database
        SaaS_Management = client["SaaS_Management"]
        college = await SaaS_Management.colleges.find_one({"collegeId": college_id})
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
async def get_colleges(status: str = None, search: str = None, skip: int = 0, limit: int = 100, current_user: dict = Depends(get_current_user), _: str = Depends(verify_csrf)):
    # Only allow superadmin to access this endpoint
    if current_user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Only superadmin can view colleges")

    SaaS_Management = client["SaaS_Management"]
    query = {}
    if status:
        query["status"] = status
    if search:
        query["collegeName"] = {"$regex": search, "$options": "i"}
    cursor = SaaS_Management.colleges.find(query).skip(skip).limit(limit)
    colleges = []
    async for college in cursor:
        college["_id"] = str(college["_id"])
        colleges.append(college)
    return {"colleges": colleges}
    
@app.post("/colleges/{college_id}/approve")
async def approve_college(college_id: str, current_user: dict = Depends(get_current_user), _: str = Depends(verify_csrf)):
    if current_user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Only superadmin can approve colleges")

    SaaS_Management = client["SaaS_Management"]

    college = await SaaS_Management.colleges.find_one({"collegeId": college_id})
    if not college:
        raise HTTPException(status_code=404, detail="College not found")
    if college.get("status") == "approved":
        return {"status": "already_approved", "message": f"College {college['collegeName']} is already approved."}
    if college.get("status") == "rejected":
        raise HTTPException(status_code=400, detail="College has been rejected and cannot be approved.")
    # Update status to approved
    await SaaS_Management.colleges.update_one({"collegeId": college_id}, {"$set": {"status": "approved"}})

    try:
        collegedb = client[college["databaseName"]]
        existing_collections = await collegedb.list_collection_names()
        
        collections_to_create = ["groups", "messages", "userchats", "Admin", "Alumni", "Student"]
        for coll in collections_to_create:
            if coll not in existing_collections:
                print(f"Creating collection {coll} in {college['databaseName']}")
                await collegedb.create_collection(coll)

        await collegedb["messages"].create_index([("senderId", 1), ("receiverId", 1), ("timestamp", -1)])
        await collegedb["messages"].create_index([("groupId", 1), ("timestamp", -1)])
        await collegedb["groups"].create_index([("members", 1)])
        print(f"All collections created successfully for {college['databaseName']}")
    except Exception as e:
        print(f"Error creating collections: {e}")
        # You might want to revert the approval status if collection creation fails
        # await SaaS_Management.colleges.update_one({"collegeId": college_id}, {"$set": {"status": "pending"}})
        # raise HTTPException(status_code=500, detail=f"Error creating collections: {str(e)}")

    return {"message": "College approved successfully"}

@app.post("/colleges/{college_id}/reject")
async def reject_college(college_id: str, current_user: dict = Depends(get_current_user), _: str = Depends(verify_csrf)):
    if current_user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Only superadmin can reject colleges")

    SaaS_Management = client["SaaS_Management"]
    college = await SaaS_Management.colleges.find_one({"collegeId": college_id})
    if not college:
        raise HTTPException(status_code=404, detail="College not found")
    if college.get("status") == "rejected":
        return {"status": "already_rejected", "message": f"College {college['collegeName']} is already rejected."}
    if college.get("status") == "approved":
        raise HTTPException(status_code=400, detail="College has been approved and cannot be rejected.")
    # Update status to rejected
    await SaaS_Management.colleges.update_one({"collegeId": college_id}, {"$set": {"status": "rejected"}})
    return {"message": "College rejected successfully"}

class CollegeLogin(BaseModel):
    collegeId: str
    password: str

from fastapi import FastAPI, HTTPException, status
from fastapi.responses import JSONResponse
from datetime import timedelta
import secrets

ACCESS_TOKEN_EXPIRE_MINUTES = 60  # or your desired value

@app.post("/college-login")
async def college_login(credentials: CollegeLogin):
    SaaS_Management = client["SaaS_Management"]
    college = await SaaS_Management["colleges"].find_one({"collegeId": credentials.collegeId})
    
    if not college:
        raise HTTPException(status_code=404, detail="College not found")
    
    college_db = client[college["databaseName"]]
    admin = await college_db["Admin"].find_one({"name": credentials.collegeId})
    
    if not admin or not verify_password(credentials.password, admin["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    await college_db["Admin"].update_one(
        {"_id": admin["_id"]},
        {"$set": {"lastSeen": get_current_time(), "status": "online"}}
    )

    # Create JWT payload
    user_info = {
        "name": admin["name"],
        "email": admin["email"],
        "role": "Admin",
        "collegeId": admin["collegeId"]
    }
    token = create_access_token(user_info, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

    # Generate CSRF token
    csrf_token = secrets.token_urlsafe(32)

    # Prepare the response
    response = JSONResponse(content={
        "college_info": {
            "collegeId": college["collegeId"],
            "collegeName": college["collegeName"],
            "status": college["status"],
        },
        "userId": str(admin["_id"]),
        "csrf_token": csrf_token  # Also send in body so frontend can use in headers
    })

    # Set access token as HttpOnly cookie
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="Strict",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

    # Set CSRF token (non-HttpOnly so frontend can read it)
    response.set_cookie(
        key="csrf_token",
        value=csrf_token,
        secure=True,
        samesite="Strict",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    print(response)
    return response



@app.get("/admins/")
async def list_admins(current_user: dict = Depends(get_current_user)):
    college_db = current_user["collegeDb"]
    admins = []
    async for admin in college_db["Admin"].find():
        admin["_id"] = str(admin["_id"])
        if "password" in admin:
            del admin["password"]
        admins.append(admin)
    return {"admins": admins}

@app.post("/add-admin/")
async def add_admin(
    admin: AdminCreate = Body(...),
    current_user: dict = Depends(get_current_user),
    _: str = Depends(verify_csrf)
):
    # Only allow approved Admins to add new admins
    if current_user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Only admins can add new admins.")


    college_db = current_user["collegeDb"]
    college_id = current_user["collegeId"]

    # Check if email already exists in Admin collection
    existing_admin = await college_db["Admin"].find_one({"email": admin.email})
    if existing_admin:
        raise HTTPException(status_code=400, detail="Email already registered as admin.")

    admin_dict = admin.dict()
    admin_dict["role"] = "Admin"
    admin_dict["collegeId"] = college_id
    admin_dict["createdAt"] = get_current_time()
    admin_dict["collegeStatus"] = "approved"
    admin_dict["password"] = get_password_hash(admin_dict["password"])

    result = await college_db["Admin"].insert_one(admin_dict)
    new_admin = await college_db["Admin"].find_one({"_id": result.inserted_id})
    new_admin["_id"] = str(new_admin["_id"])
    del new_admin["password"]
    return {"status": "success", "admin": new_admin}


@app.delete("/admins/{admin_id}")
async def remove_admin(
    admin_id: str,
    current_user: dict = Depends(get_current_user),
    _: str = Depends(verify_csrf)
):
    # Only allow approved Admins to remove admins
    if current_user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Only admins can remove admins.")

    college_db = current_user["collegeDb"]

    # Validate ObjectId
    if not ObjectId.is_valid(admin_id):
        raise HTTPException(status_code=400, detail="Invalid admin ID.")

    # Prevent self-removal
    if str(current_user["_id"]) == admin_id:
        raise HTTPException(status_code=400, detail="Admins cannot remove themselves.")

    # Check if admin exists
    existing_admin = await college_db["Admin"].find_one({"_id": ObjectId(admin_id)})
    if not existing_admin:
        raise HTTPException(status_code=404, detail="Admin not found.")

    # Remove the admin
    result = await college_db["Admin"].delete_one({"_id": ObjectId(admin_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=500, detail="Failed to remove admin.")

    return {"status": "success", "message": f"Admin with id {admin_id} removed."}


@app.delete("/students/")
async def remove_students(
    student_ids: List[str] = Body(..., embed=True),
    current_user: dict = Depends(get_current_user),
    _: str = Depends(verify_csrf)
):
    if current_user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Only admins can remove students.")
    if current_user.get("collegeStatus") != "approved":
        raise HTTPException(status_code=403, detail="College account is not approved yet")

    college_db = current_user["collegeDb"]

    # Validate all IDs
    invalid_ids = [sid for sid in student_ids if not ObjectId.is_valid(sid)]
    if invalid_ids:
        raise HTTPException(status_code=400, detail=f"Invalid student IDs: {invalid_ids}")

    object_ids = [ObjectId(sid) for sid in student_ids]
    result = await college_db["Student"].delete_many({"_id": {"$in": object_ids}})
    return {
        "status": "success",
        "deleted_count": result.deleted_count,
        "message": f"Removed {result.deleted_count} students."
    }

@app.delete("/alumni/")
async def remove_alumni(
    alumni_ids: List[str] = Body(..., embed=True),
    current_user: dict = Depends(get_current_user),
    _: str = Depends(verify_csrf)

):
    if current_user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Only admins can remove alumni.")
    if current_user.get("collegeStatus") != "approved":
        raise HTTPException(status_code=403, detail="College account is not approved yet")

    college_db = current_user["collegeDb"]

    # Validate all IDs
    invalid_ids = [aid for aid in alumni_ids if not ObjectId.is_valid(aid)]
    if invalid_ids:
        raise HTTPException(status_code=400, detail=f"Invalid alumni IDs: {invalid_ids}")

    object_ids = [ObjectId(aid) for aid in alumni_ids]
    result = await college_db["Alumni"].delete_many({"_id": {"$in": object_ids}})
    return {
        "status": "success",
        "deleted_count": result.deleted_count,
        "message": f"Removed {result.deleted_count} alumni."
    }


@app.post("/bulk-register-students/")
async def bulk_register_students(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    _: str = Depends(verify_csrf)
):
    # Only allow Admins
    
    if current_user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Only college admins can bulk register students.")
    
    SaaS_Management = client["SaaS_Management"]
    college_id = current_user["collegeId"]
    college = await SaaS_Management.colleges.find_one({"collegeId": college_id})
    
    if not college or college.get("status") != "approved":
        raise HTTPException(status_code=403, detail="College account is not approved yet")
    college_db = current_user["collegeDb"]
    
    # Read the uploaded Excel file into a pandas DataFrame
    contents = await file.read()
    df = pd.read_excel(io.BytesIO(contents))

    # Normalize column names
    df.columns = [col.strip().lower() for col in df.columns]

    # Check for required columns
    if not {'rollno', 'email'}.issubset(df.columns):
        raise HTTPException(status_code=400, detail="Excel must have 'rollno' and 'email' columns.")

    # Prepare results for Excel output
    passwords = []
    statuses = []
    
    # Track number of successfully created students
    created_count = 0

    for idx, row in df.iterrows():
        rollno = str(row['rollno']).strip()
        email = str(row['email']).strip().lower()
        password = str(random.randint(100000, 999999))

        # Check if student already exists
        existing = await college_db["Student"].find_one({"email": email})
        if existing:
            passwords.append("")
            statuses.append("Already Exists")
            continue

        # Prepare student dict
        student_obj = StudentSchema(
            name=rollno,
            email=email,
            role="Student",
            collegeId=college_id,
            rollno=rollno,
            status="offline",
            lastSeen=None,
            createdAt=get_current_time()
        )
        student_dict = student_obj.dict()
        student_dict["password"] = get_password_hash(password)
        await college_db["Student"].insert_one(student_dict)
        passwords.append(password)
        statuses.append("Created")
        created_count += 1

    # Add password and status columns to DataFrame
    df['password'] = passwords
    df['status'] = statuses
    
    # Update meta collection with the count of newly created students
    if created_count > 0:
        await update_college_meta(college_db, "student", created_count)

    # Write the DataFrame to an Excel file in memory
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False)
    output.seek(0)

    # Return the file as a response
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=students_with_passwords.xlsx"}
    )

@app.get("/students/", response_model=List[StudentSchema])
async def get_all_students(current_user: User = Depends(get_current_user)):
    """
    Get all students from the college's database.
    Returns:
        List[StudentSchema]: List of all student documents
    """
    if (current_user["role"] != "Admin"):
         raise HTTPException(status_code=403, detail="Only college admins can get students data.")
    college_db = current_user["collegeDb"]
    students = []
    projection = {"_id": 1, "name": 1, "email": 1,"department":1,"status":1,"rollno":1,"lastSeen":1}
    async for student in college_db.Student.find({},projection):

        students.append(StudentSchema(**student))
    return students

@app.post("/bulk-register-alumni/")
async def bulk_register_alumni(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    _: str = Depends(verify_csrf)
):
    # Only allow Admins
    if current_user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Only college admins can bulk register alumni.")
    SaaS_Management = client["SaaS_Management"]
    college_id = current_user["collegeId"]
    college = await SaaS_Management.colleges.find_one({"collegeId": college_id})
    if not college or college.get("status") != "approved":
        raise HTTPException(status_code=403, detail="College account is not approved yet")
    college_db = current_user["collegeDb"]
    
    # Read the uploaded Excel file into a pandas DataFrame
    contents = await file.read()
    df = pd.read_excel(io.BytesIO(contents))

    # Normalize column names
    df.columns = [col.strip().lower() for col in df.columns]

    # Check for required columns
    if not {'name', 'prn', 'email'}.issubset(df.columns):
        raise HTTPException(status_code=400, detail="Excel must have 'name', 'prn', and 'email' columns.")

    # Prepare results for Excel output
    passwords = []
    statuses = []

    for idx, row in df.iterrows():
        name = str(row['name']).strip()
        prn = str(row['prn']).strip()
        email = str(row['email']).strip().lower()
        password = str(random.randint(100000, 999999))

        # Check if alumni already exists
        existing = await college_db["Alumni"].find_one({"email": email})
        if existing:
            passwords.append("")
            statuses.append("Already Exists")
            continue

        # Prepare alumni dict
        alumni_obj = AlumniSchema(
            name=name,
            email=email,
            role="Alumni",
            collegeId=college_id,
            prn=prn,
            status="offline",
            lastSeen=None,
            createdAt=get_current_time()
        )
        alumni_dict = alumni_obj.dict()
        alumni_dict["password"] = get_password_hash(password)
        await college_db["Alumni"].insert_one(alumni_dict)
        passwords.append(password)
        statuses.append("Created")
        created_count += 1

    # Add password and status columns to DataFrame
    df['password'] = passwords
    df['status'] = statuses

    if created_count > 0:
        await update_college_meta(college_db, "student", created_count)

    # Write the DataFrame to an Excel file in memory
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False)
    output.seek(0)

    # Return the file as a response
    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename=alumni_with_passwords.xlsx"}
    )

from fastapi import UploadFile, File, Form
import os
from uuid import uuid4

@app.post("/achievements/")
async def create_achievement(
    title: str = Form(...),
    body: str = Form(...),
    photo: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    _: str = Depends(verify_csrf)

):
    if current_user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Only admins can add achievements.")

    college_db = current_user["collegeDb"]
    college_name = current_user.get("collegeName") or current_user.get("collegeId")
  
    safe_college_name = str(college_name).replace(" ", "_")

 
    uploads_dir = os.path.join("data", safe_college_name, "photos")
    os.makedirs(uploads_dir, exist_ok=True)
    file_ext = os.path.splitext(photo.filename)[1]
    unique_filename = f"{uuid4().hex}{file_ext}"
    file_path = os.path.join(uploads_dir, unique_filename)

    with open(file_path, "wb") as buffer:
        buffer.write(await photo.read())

    # Store the relative path for later retrieval
    photo_url = f"/{uploads_dir.replace(os.sep, '/')}/{unique_filename}"

    achievement_doc = {
        "title": title,
        "body": body,
        "photo_url": photo_url,
        "createdBy": {
            "user_id": str(current_user["_id"]),
            "name": current_user["name"],
            "role": current_user["role"],
            "collegeId": current_user["collegeId"]
        },
        "createdAt": get_current_time()
    }

    result = await college_db["achievements"].insert_one(achievement_doc)
    achievement_doc["_id"] = str(result.inserted_id)
    
    # Update meta collection for achievements
    await update_college_meta(college_db, "achievement")
    
    return {"status": "success", "achievement": achievement_doc}

@app.get("/college-stats")
async def get_college_stats(current_user: dict = Depends(get_current_user), _: str = Depends(verify_csrf)):
    """Get statistics for the college dashboard"""
    college_db = current_user["collegeDb"]
    
    # Get meta data
    meta = await college_db["meta"].find_one({})
    if not meta:
        meta = await initialize_college_meta(college_db)
    
    # Convert ObjectId to string
    meta["_id"] = str(meta["_id"])
    
    return meta

@app.get("/alumni/", response_model=List[AlumniSchema])
async def get_all_alumni(current_user: User = Depends(get_current_user)):
    """
    Get all alumni from the college's database.
    Returns:
        List[AlumniSchema]: List of all alumni documents
    """
    if (current_user["role"] != "Admin"):
         raise HTTPException(status_code=403, detail="Only college admins can get alumni data.")
    college_db = current_user["collegeDb"]
    alumni = []
    projection = {"_id": 1, "name": 1, "email": 1, "department": 1, "status": 1, "prn": 1, "gradYear": 1, "currentRole": 1, "lastSeen": 1}
    async for alum in college_db.Alumni.find({}, projection):
        alumni.append(AlumniSchema(**alum))
    return alumni

@app.post("/add-student/")
async def add_student(
    student: StudentSchema,
    current_user: dict = Depends(get_current_user),
    _: str = Depends(verify_csrf)
):
    # Only allow Admins
    if current_user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Only college admins can add students.")
    
    college_db = current_user["collegeDb"]
    college_id = current_user["collegeId"]
    
    # Check if student already exists
    existing = await college_db["Student"].find_one({"email": student.email})
    if existing:
        raise HTTPException(status_code=400, detail="Student with this email already exists.")
    
    # Generate a random password
    password = str(random.randint(100000, 999999))
    
    # Prepare student dict
    student_dict = student.dict(exclude_none=True)
    student_dict["role"] = "Student"
    student_dict["collegeId"] = college_id
    student_dict["status"] = "offline"
    student_dict["createdAt"] = get_current_time()
    student_dict["password"] = get_password_hash(password)
    
    result = await college_db["Student"].insert_one(student_dict)
    
    # Update meta collection
    await update_college_meta(college_db, "student", 1)
    
    # Return the created student with password
    student_dict["_id"] = str(result.inserted_id)
    student_dict["password"] = password  # Return the plain password for admin to share
    
    return {
        "status": "success",
        "message": "Student added successfully",
        "student": student_dict
    }

@app.post("/add-alumni/")
async def add_alumni(
    alumni: AlumniSchema,
    current_user: dict = Depends(get_current_user),
    _: str = Depends(verify_csrf)
):
    # Only allow Admins
    if current_user["role"] != "Admin":
        raise HTTPException(status_code=403, detail="Only college admins can add alumni.")
    
    college_db = current_user["collegeDb"]
    college_id = current_user["collegeId"]
    
    # Check if alumni already exists
    existing = await college_db["Alumni"].find_one({"email": alumni.email})
    if existing:
        raise HTTPException(status_code=400, detail="Alumni with this email already exists.")
    
    # Generate a random password
    password = str(random.randint(100000, 999999))
    
    # Prepare alumni dict
    alumni_dict = alumni.dict(exclude_none=True)
    alumni_dict["role"] = "Alumni"
    alumni_dict["collegeId"] = college_id
    alumni_dict["status"] = "offline"
    alumni_dict["createdAt"] = get_current_time()
    alumni_dict["password"] = get_password_hash(password)
    
    result = await college_db["Alumni"].insert_one(alumni_dict)
    
    # Update meta collection
    await update_college_meta(college_db, "alumni", 1)
    
    # Return the created alumni with password
    alumni_dict["_id"] = str(result.inserted_id)
    alumni_dict["password"] = password  # Return the plain password for admin to share
    
    return {
        "status": "success",
        "message": "Alumni added successfully",
        "alumni": alumni_dict
    }

