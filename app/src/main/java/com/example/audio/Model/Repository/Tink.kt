package com.example.audio.Model.Repository

import android.content.Context
import com.google.crypto.tink.Aead
import com.google.crypto.tink.KeyTemplates
import com.google.crypto.tink.aead.AeadConfig
import com.google.crypto.tink.integration.android.AndroidKeysetManager

class TinkCryptoManager(private val context: Context) {

    init {
        // Initialize Tink's AEAD (Authenticated Encryption with Associated Data)
        AeadConfig.register()
    }

    private val aead: Aead by lazy {
        AndroidKeysetManager.Builder()
            // Tink stores its encrypted keyset in a standard shared pref for persistence
            .withSharedPref(context, "tink_keyset", "tink_prefs")
            // The encryption standard to use
            .withKeyTemplate(KeyTemplates.get("AES256_GCM"))
            // The Master Key URI that protects the keyset inside the Android Keystore
            .withMasterKeyUri("android-keystore://my_app_master_key")
            .build()
            .keysetHandle
            .getPrimitive(Aead::class.java)
    }

    fun encrypt(data: String): ByteArray {
        // The second parameter is 'associatedData', which we don't need here, so we pass null/empty
        return aead.encrypt(data.toByteArray(), ByteArray(0))
    }

    fun decrypt(data: ByteArray): String {
        return String(aead.decrypt(data, ByteArray(0)))
    }
}