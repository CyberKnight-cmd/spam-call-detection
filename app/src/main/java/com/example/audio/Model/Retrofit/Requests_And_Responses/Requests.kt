package com.example.audio.Model.Retrofit.Requests_And_Responses

import com.google.gson.annotations.SerializedName

// Represents a single contact inside the listOfContacts array
data class Contact(
    @SerializedName("username") val username: String,
    @SerializedName("password") val password: String // Making this nullable just to be safe
)

// Represents the user object returned during login
data class LoggedInUser(
    @SerializedName("username") val username: String,
    @SerializedName("phone_number") val phone_number: String,
    @SerializedName("listOfContacts") val listOfContacts: List<Contact>
)


// SIGNUP REQUEST
data class SignupRequest(
    @SerializedName("username") val username: String,
    @SerializedName("password") val password: String
)

// RESPONSE (201 Created)
data class SignupResponse(
    @SerializedName("message") val message: String
)

// LOGIN REQUEST (Note: structurally identical to SignupRequest, but good to keep separate for clarity)
data class LoginRequest(
    @SerializedName("username") val username: String,
    @SerializedName("password") val password: String
)

// RESPONSE (200 OK)
data class LoginResponse(
    val accessToken: String,
    val refreshToken: String,
    @SerializedName("user") val user: LoggedInUser
)

data class RefreshRequest(
    val refreshToken: String
)

data class RefreshResponse(
    val accessToken: String,
    val refreshToken: String
)

// ADD CONTACT REQUEST
data class AddContactRequest(
    @SerializedName("password") val password: String,
    @SerializedName("contactUsername") val contactUsername: String,
    @SerializedName("contactPassword") val contactPassword: String
)

// RESPONSE (200 OK)
data class ContactResponse(
    @SerializedName("message") val message: String,
    @SerializedName("listOfContacts") val listOfContacts: List<Contact>
)

// REQUEST
data class GetContactsRequest(
    @SerializedName("password") val password: String
)

data class DeleteContactRequest(
    val password: String,
    val contactPassword: String
)


data class ErrorResponse(
    val message: String
)