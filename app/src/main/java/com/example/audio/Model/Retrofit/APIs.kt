package com.example.audio.Model.Retrofit

import com.example.audio.Model.Retrofit.Requests_And_Responses.AddContactRequest
import com.example.audio.Model.Retrofit.Requests_And_Responses.ContactResponse
import com.example.audio.Model.Retrofit.Requests_And_Responses.DeleteContactRequest
import com.example.audio.Model.Retrofit.Requests_And_Responses.GetContactsRequest
import com.example.audio.Model.Retrofit.Requests_And_Responses.LoginRequest
import com.example.audio.Model.Retrofit.Requests_And_Responses.LoginResponse
import com.example.audio.Model.Retrofit.Requests_And_Responses.RefreshRequest
import com.example.audio.Model.Retrofit.Requests_And_Responses.RefreshResponse
import com.example.audio.Model.Retrofit.Requests_And_Responses.SignupRequest
import com.example.audio.Model.Retrofit.Requests_And_Responses.SignupResponse
import retrofit2.http.Body
import retrofit2.http.POST

interface APIs {
    // 1. Signup Endpoint
    @POST("signup")
    suspend fun signup(
        @Body request: SignupRequest
    ): SignupResponse

    // 2. Login Endpoint
    @POST("login")
    suspend fun login(
        @Body request: LoginRequest
    ): LoginResponse

    // 3. Add Contact Endpoint
    @POST("add-contact")
    suspend fun addContact(
        @Body request: AddContactRequest
    ): ContactResponse

    // 4. Get Contacts Endpoint
    @POST("get-contacts")
    suspend fun getContacts(
        @Body request: GetContactsRequest
    ): ContactResponse

    @POST("delete-contact")
    suspend fun deleteContact(
        @Body req: DeleteContactRequest
    ): ContactResponse
}

interface AuthAPIs {
    //Refresh
    @POST("refresh")
    suspend fun refresh(
        @Body req: RefreshRequest
    ): RefreshResponse

}