package com.example.audio.Model.Retrofit.TokenHandlers

class TokenStoreClass: TokenStore {
    private var accessToken: String? = null
    private var refreshToken: String? = null

    override fun storeTokens(accessToken: String, refreshToken: String) {
        this.accessToken = accessToken
        this.refreshToken = refreshToken
    }

    override fun getAccessToken(): String? {
        return accessToken
    }

    override fun getRefreshToken(): String? {
        return refreshToken
    }

    override fun logout() {
        accessToken = null
        refreshToken = null
    }
}