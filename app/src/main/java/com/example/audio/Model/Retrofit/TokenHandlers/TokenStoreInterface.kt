package com.example.audio.Model.Retrofit.TokenHandlers

interface TokenStore {
    fun storeTokens(accessToken: String, refreshToken: String)

    fun getAccessToken(): String?

    fun getRefreshToken(): String?

    fun logout()
}