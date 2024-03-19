import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshToken = async(userId) => {
  try {

    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ValidateBeforeSave:false}) //false because validation needs to off while saving otherwise it gives an error

    return {accessToken,refreshToken}
    
  } catch (error) {
    throw new ApiError(500,"Internal Server Error")
    
  }
}

const registerUser = asyncHandler(async (req, res) => {
  //get user from frontend
  //validation not-empty
  //check if user already exists : username and email
  //check for images and avatar
  //upload them on cloudinary
  //create user object and save to the db
  //remove password and refreshToken from response
  //check for user creation
  //return res

  const { fullName, username, email, password } = req.body;
  console.log("email: ", email);

  if (
    [fullName, username, email, password].some((feild) => feild?.trim() === "")
  ) {
    throw new ApiError(400, "Fullname,username,email and password is required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  console.log("req files ", req.files);
  const avatarLocalPath = req.files?.avatar[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(404, "Avatar image is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar image is required");
  }

  const user = await User.create({
    fullName,
    username: username.toLowerCase(),
    email,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "User creation failed");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User created successfully"));
});



const loginUser = asyncHandler(async (req, res) => {
  //user login steps
  //req body data
  //username or email validations
  //find user
  //check for password
  //generate refresh and access token
  //send cookies
  const { username, email, password } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await user.isPasswordCorrect(password)

  if(!isPasswordValid) {throw new ApiError(400,"Password is incorrect");}

  const {refreshToken
  ,accessToken
} = await generateAccessAndRefreshToken(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
    httpOnly : true,
    secure : true,
  }

  return res 
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(200,{
      user : loggedInUser,
      accessToken,
      refreshToken
    },
    "User logged in successfully")
  )
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set : {
        refreshToken : undefined,
      },
    },
    {
      new : true
    })

    const options = {
      httpOnly : true,
      secure : true,
    }
    return res
    .status(200)
    .clearCookie("accessToken",accessToken)
    .clearCookie("refreshToken",refreshToken)
    .json(
      new ApiResponse(200, {}, "User Loggedout Successfully")
    )
})

export { registerUser,loginUser,logoutUser };
