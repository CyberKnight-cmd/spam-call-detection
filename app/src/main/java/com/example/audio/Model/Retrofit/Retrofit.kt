package com.example.audio.Model.Retrofit

import android.util.Log
import com.example.audio.Model.DataStoreRepository
import com.example.audio.Model.Retrofit.TokenHandlers.AuthInterceptor
import com.example.audio.Model.Retrofit.TokenHandlers.TokenAuthenticator
import com.example.audio.Model.Retrofit.TokenHandlers.TokenStoreClass
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class RetrofitClient(dataStoreDepo: DataStoreRepository) {
    //HTTPLoggingInterceptor
    val loggingInterceptor = HttpLoggingInterceptor { mess ->
        Log.d("HTTP", mess)
    }
        .apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

    val mainOkHttpClient = OkHttpClient.Builder()
        .addInterceptor(AuthInterceptor(dataStoreDepo))
        .authenticator(
            TokenAuthenticator(dataStoreDepo)
        )
        .addInterceptor(loggingInterceptor)             //` ← The LoggingInterceptor
        .build()


    private val BASE_URL = "http://10.103.14.10:3000/"

    private val retrofit by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(mainOkHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    val api: APIs by lazy {
        retrofit.create(APIs::class.java)
    }
}
