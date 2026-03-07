package com.example.audio

import android.util.Log
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import okio.ByteString.Companion.toByteString

class AudioWebSocketClient(
    private val url: String,
    private val onMessageReceived: (String) -> Unit
) {
    private var webSocket: WebSocket? = null
    private val client = OkHttpClient()

    fun connect() {
        val request = Request.Builder().url(url).build()
        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                println("WebSocket Connected successfully")
            }

            // 🚀 ADDED THIS: Catches any text the Python server sends back!
            override fun onMessage(webSocket: WebSocket, text: String) {
                super.onMessage(webSocket, text)

                onMessageReceived(text)
                Log.d("Srijan", "Server replied with: $text")
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                println("WebSocket Failed: ${t.message}")
            }
        })
    }

    fun sendRawAudio(pcmData: ByteArray) {
        // Sends the raw audio bytes continuously without saving to disk
        webSocket?.send(pcmData.toByteString())
    }

    fun disconnect() {
        webSocket?.close(1000, "App closed")
        webSocket = null
    }
}