package com.example.audio.Model.Retrofit.TokenHandlers

import com.example.audio.Model.Retrofit.AuthAPIs
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RefreshRetrofit {
    private const val BASE_URL = "http://10.103.14.10:3000/"

    private val retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    val authApi: AuthAPIs by lazy {
        retrofit.create(AuthAPIs::class.java)
    }
}