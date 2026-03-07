package com.example.audio.Model.Repository

import android.util.Log
import com.example.audio.Model.Retrofit.Requests_And_Responses.AddContactRequest
import com.example.audio.Model.Retrofit.Requests_And_Responses.ContactResponse
import com.example.audio.Model.Retrofit.Requests_And_Responses.DeleteContactRequest
import com.example.audio.Model.Retrofit.Requests_And_Responses.ErrorResponse
import com.example.audio.Model.Retrofit.Requests_And_Responses.GetContactsRequest
import com.example.audio.Model.Retrofit.Requests_And_Responses.LoginRequest
import com.example.audio.Model.Retrofit.Requests_And_Responses.LoginResponse
import com.example.audio.Model.Retrofit.Requests_And_Responses.SignupRequest
import com.example.audio.Model.Retrofit.Requests_And_Responses.SignupResponse
import com.example.audio.Model.Retrofit.RetrofitClient
import com.google.gson.Gson
import org.json.JSONObject
import retrofit2.HttpException

class NetworkRepository(val retrofitClient: RetrofitClient) {
    suspend fun signUp(request: SignupRequest): SignUp {
        return try {
            val signinResponse = retrofitClient.api.signup(request)

            SignUp.Success(signinResponse)
        } catch (e: HttpException) {
            val errorJson = e.response()?.errorBody()?.string()

            val errorMessage = try {
                Gson().fromJson(errorJson, ErrorResponse::class.java).message
            } catch (ex: Exception) {
                "Something went wrong"
            }

            SignUp.Error(errorMessage ?: "Unkhown error")
        } catch (e: Exception) {
            Log.d("SignUp", e.toString())

            SignUp.Error(e.toString())
        }
    }

    suspend fun signIn(request: LoginRequest): SignIn {
        return try {
            val loginResponse = retrofitClient.api.login(request)

            SignIn.Success(loginResponse)
        } catch (e: HttpException) {
            //            val errorBody = e.response()?.errorBody()?.string()
//
//            Log.d("SignUp", "Error body: $errorBody")
            val errorJson = e.response()?.errorBody()?.string()

            val errorMessage = try {
                Gson().fromJson(errorJson, ErrorResponse::class.java).message
            } catch (ex: Exception) {
                "Something went wrong"
            }

            SignIn.Error(errorMessage ?: "Unkhown error")
        } catch (e: Exception) {
            Log.d("SignIn", e.toString())
            SignIn.Error(e.toString())
        }
    }

    suspend fun AddC(request: AddContactRequest): AddC {
        return try {
            val loginResponse = retrofitClient.api.addContact(request)

            AddC.Success(loginResponse)
        } catch (e: HttpException) {

            if (e.code() == 401) {
                AddC.Expired
            } else {
                val errorJson = e.response()?.errorBody()?.string()

                val errorMessage = try {
                    Gson().fromJson(errorJson, ErrorResponse::class.java).message
                } catch (ex: Exception) {
                    "Something went wrong"
                }

                AddC.Error(errorMessage ?: "Unkhown error")
            }
        } catch (e: Exception) {
            Log.d("SignIn", e.toString())
            AddC.Error(e.toString())
        }
    }

    suspend fun getContacts(request: GetContactsRequest): GetContactsState {
        return try {
            val response = retrofitClient.api.getContacts(request)
            GetContactsState.Success(response)
        } catch (e: HttpException) {
            if (e.code() == 401) {
                GetContactsState.Expired
            } else {

                val errorJson = e.response()?.errorBody()?.string()

                val errorMessage = try {
                    Gson().fromJson(errorJson, ErrorResponse::class.java).message
                } catch (ex: Exception) {
                    "Something went wrong"
                }

                GetContactsState.Error(errorMessage)
            }
        } catch (e: Exception) {
            Log.d("GetContacts", e.toString())
            GetContactsState.Error(e.toString())
        }
    }

    suspend fun deleteContacts(request: DeleteContactRequest): GetContactsState {
        return try {
            val response = retrofitClient.api.deleteContact(request)
            GetContactsState.Success(response)
        } catch (e: HttpException) {
            if (e.code() == 401) {
                GetContactsState.Expired
            }else{
                val errorJson = e.response()?.errorBody()?.string()

                val errorMessage = try {
                    Gson().fromJson(errorJson, ErrorResponse::class.java).message
                } catch (ex: Exception) {
                    "Something went wrong"
                }

                GetContactsState.Error(errorMessage)
            }
        } catch (e: Exception) {
            Log.d("GetContacts", e.toString())
            GetContactsState.Error(e.toString())
        }
    }
}

sealed interface SignUp {
    object Loading : SignUp
    data class Success(val success: SignupResponse) : SignUp
    data class Error(val error: String) : SignUp
}

sealed interface SignIn {
    object Loading : SignIn
    data class Success(val success: LoginResponse) : SignIn
    data class Error(val error: String) : SignIn
}

sealed interface AddC {
    object Loading : AddC
    data class Success(val success: ContactResponse) : AddC
    data class Error(val error: String) : AddC
    data object Expired : AddC
}

sealed interface GetContactsState {
    object Loading : GetContactsState
    data class Success(val success: ContactResponse) : GetContactsState
    data class Error(val error: String) : GetContactsState
    data object Expired : GetContactsState
}

sealed interface DeleteContactsState {
    object Loading : DeleteContactsState
    data class Success(val success: ContactResponse) : DeleteContactsState
    data class Error(val error: String) : DeleteContactsState
}
