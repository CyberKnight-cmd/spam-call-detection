package com.example.audio

import im.zego.zegoexpress.ZegoExpressEngine
import im.zego.zegoexpress.callback.IZegoAudioDataHandler
import im.zego.zegoexpress.constants.ZegoAudioChannel
import im.zego.zegoexpress.constants.ZegoAudioDataCallbackBitMask
import im.zego.zegoexpress.constants.ZegoAudioSampleRate
import im.zego.zegoexpress.entity.ZegoAudioFrameParam
import java.nio.ByteBuffer

fun startAudioIntercept(webSocketClient: AudioWebSocketClient) {
    val engine = ZegoExpressEngine.getEngine() ?: return

    val param = ZegoAudioFrameParam().apply {
        channel = ZegoAudioChannel.MONO
        sampleRate = ZegoAudioSampleRate.ZEGO_AUDIO_SAMPLE_RATE_16K
    }

    val bitmask = ZegoAudioDataCallbackBitMask.PLAYER.value()

    engine.startAudioDataObserver(bitmask, param)

    var audioBuffer = ByteArray(0)
    val ONE_SECOND_BYTES = 80000

    engine.setAudioDataHandler(object : IZegoAudioDataHandler() {
        override fun onPlayerAudioData(data: ByteBuffer, dataLength: Int, param: ZegoAudioFrameParam, streamID: String) {
            val pcmBytes = ByteArray(dataLength)
            data.get(pcmBytes)
            audioBuffer += pcmBytes

            while (audioBuffer.size >= ONE_SECOND_BYTES) {
                val oneSecondChunk = audioBuffer.copyOfRange(0, ONE_SECOND_BYTES)
                webSocketClient.sendRawAudio(oneSecondChunk)
                audioBuffer = audioBuffer.copyOfRange(ONE_SECOND_BYTES, audioBuffer.size)
            }
        }

        override fun onCapturedAudioData(data: ByteBuffer, dataLength: Int, param: ZegoAudioFrameParam) {}
        override fun onMixedAudioData(data: ByteBuffer, dataLength: Int, param: ZegoAudioFrameParam) {}
    })
}

fun stopAudioIntercept() {
    val engine = ZegoExpressEngine.getEngine() ?: return
    engine.stopAudioDataObserver()
    engine.setAudioDataHandler(null)
}