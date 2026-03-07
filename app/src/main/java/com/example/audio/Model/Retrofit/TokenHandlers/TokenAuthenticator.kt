package com.example.audio.Model.Retrofit.TokenHandlers

import com.example.audio.Model.DataStoreRepository
import com.example.audio.Model.Retrofit.AuthAPIs
import com.example.audio.Model.Retrofit.Requests_And_Responses.RefreshRequest
import com.example.audio.Model.Retrofit.RetrofitClient
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import okhttp3.Request
import okhttp3.Response
import okhttp3.Route
import okhttp3.Authenticator


class TokenAuthenticator(
    private val dataStoreRepo: DataStoreRepository,
) :    // Source for internal token refresh requests
    Authenticator {
    override fun authenticate(
        route: Route?,
        response: Response
    ): Request? {   // Handles the authentication process
        val refreshToken =
            runBlocking { dataStoreRepo.getRefreshToken().first() }
                ?: return null    // Get the refresh token

        if (responseCount(response) >= 2) {  // Check if refresh has failed more than twice
            runBlocking { dataStoreRepo.clearUser() }
            return null    // Cancel the request if too many attempts
        }

        return try {
            val newTokens = runBlocking {  // Request new access and refresh tokens internally
                RefreshRetrofit.authApi.refresh(RefreshRequest(refreshToken))
            }

            runBlocking {
                val username = dataStoreRepo.getUsername().first()
                val phone_number = dataStoreRepo.getPhoneNumber().first()

                if (username != null && phone_number != null) {
                    dataStoreRepo.saveSession(
                        username,
                        phone_number,
                        newTokens.accessToken,
                        newTokens.refreshToken
                    )  // Save the new tokens
                }
            }

            response.request.newBuilder()
                .header(   // Retry the failed request with the new access token
                    "Authorization",
                    "Bearer ${newTokens.accessToken}")
                .build()
        } catch (e: Exception) {  // Cancel the request if the network fails
            runBlocking { dataStoreRepo.clearUser() }
            null
        }
    }

    private fun responseCount(response: Response): Int {    // Counts the number of failed authentication attempts
        var count = 1
        var priorResponse = response.priorResponse
        while (priorResponse != null) {
            count++
            priorResponse = priorResponse.priorResponse
        }
        return count
    }
}