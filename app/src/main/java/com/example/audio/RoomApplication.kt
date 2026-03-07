package com.example.audio

import android.app.Application
import android.util.Log
import com.example.audio.Model.Room.NoteDatabase
import com.zegocloud.uikit.prebuilt.call.ZegoUIKitPrebuiltCallService
import com.zegocloud.uikit.prebuilt.call.config.ZegoMenuBarButtonName
import com.zegocloud.uikit.prebuilt.call.event.CallEndListener
import com.zegocloud.uikit.prebuilt.call.event.ErrorEventsListener
import com.zegocloud.uikit.prebuilt.call.invite.ZegoUIKitPrebuiltCallInvitationConfig
import com.zegocloud.uikit.prebuilt.call.invite.internal.ZegoUIKitPrebuiltCallConfigProvider

class RoomApplication : Application() {
    val database: NoteDatabase by lazy { NoteDatabase.Companion.getDatabase(this) }

    var webSocketClient: AudioWebSocketClient? = null
    var onMessageCallback: ((String) -> Unit)? = null

    override fun onCreate() {
        super.onCreate()
        // Notice we removed Zego from here!
        // It will sit quietly until the user clicks "Get Started".
    }

    // 🚀 NEW FUNCTION: We call this from the UI once we have the user's details!
    fun initZegoCalling(currentUserID: String, currentUserName: String) {
        val appID = 1397594403L
        val appSign = "3cb34d35b93661ecf2ed1eecdff06099ff2c138265ff0e88da80556ef34166b0"

        val callInvitationConfig = ZegoUIKitPrebuiltCallInvitationConfig().apply {
            provider = ZegoUIKitPrebuiltCallConfigProvider { invitationData ->
                val config = ZegoUIKitPrebuiltCallInvitationConfig.generateDefaultConfig(invitationData)

                config.topMenuBarConfig.isVisible = true
                config.topMenuBarConfig.buttons.add(ZegoMenuBarButtonName.MINIMIZING_BUTTON)

                if (invitationData.inviter?.userID != currentUserID) {
                    webSocketClient = AudioWebSocketClient("ws://10.103.14.10:8000/ws/audio") { text ->
                        onMessageCallback?.invoke(text)
                    }
                    webSocketClient?.connect()
                    startAudioIntercept(webSocketClient!!)
                }else{
                    onMessageCallback?.invoke("CALLING")
                }
                config
            }
        }

        ZegoUIKitPrebuiltCallService.events.errorEventsListener =
            ErrorEventsListener { errorCode, message -> Log.e("Srijan", "⚠️ ZEGO ERROR: $message") }

        ZegoUIKitPrebuiltCallService.events.callEvents.callEndListener =
            CallEndListener { _, _ ->
                stopAudioIntercept()
                webSocketClient?.disconnect()

                onMessageCallback?.invoke("DISCONNECTED")
            }

        // Initialize Zego with the dynamic data!
        ZegoUIKitPrebuiltCallService.init(this, appID, appSign, currentUserID, currentUserName, callInvitationConfig)
        Log.d("Srijan", "Zego Initialized for User: $currentUserName ($currentUserID)")
    }

//    // 🚀 NEW FUNCTION: Call this when the user logs out!
//    fun disconnectZego() {
//        // This single line completely shuts down the Zego background service,
//        // severs the signaling connection, and marks the user as offline.
//        ZegoUIKitPrebuiltCallService.unInit()
//        Log.d("Srijan", "Zego Offline: User fully disconnected.")
//    }
}