plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.google.ksp) // Changed to use version catalog alias
}

android {
    namespace = "com.example.audio"
    compileSdk {
        version = release(36)
    }

    // 🚀 The modern AGP 8+ way to stop TFLite compression
    androidResources {
        noCompress += "tflite"
    }

    defaultConfig {
        applicationId = "com.example.audio"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        // ADD THIS BLOCK:
        ndk {
            abiFilters += listOf("armeabi-v7a", "arm64-v8a")
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            isShrinkResources = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
//    kotlinOptions {
//        jvmTarget = "11"
//    }

    // NEW CODE
    kotlin {
        compilerOptions {
            jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
        }
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.navigation.compose)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.10.2")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.10.2")

//ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.10.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.10.0")

// Room
    implementation("androidx.room:room-runtime:2.8.4")
    implementation("androidx.room:room-ktx:2.8.4")
    ksp("androidx.room:room-compiler:2.8.4")

//Retrofit
// For Retrofit (our "waiter" for making network calls)
    implementation("com.squareup.retrofit2:retrofit:3.0.0")

//HttpLoggingInterceptor
    implementation("com.squareup.okhttp3:logging-interceptor:5.3.2")

// For GSON (to automatically convert the server's JSON response into our Kotlin data classes)
    implementation("com.squareup.retrofit2:converter-gson:3.0.0")


    //Lottie
    implementation("com.airbnb.android:lottie-compose:6.7.1")


    //Google fonts
    implementation("androidx.compose.ui:ui-text-google-fonts:1.10.3")

    //Material theme expressive(BOTH)
    implementation("androidx.compose.material:material:1.10.3")
    implementation("androidx.compose.material3:material3:1.5.0-alpha14")

    // Material icons for Compose
    implementation("androidx.compose.material:material-icons-extended:1.7.8")

    // Add this line to your module-level build.gradle file's dependencies, usually named [app].
    implementation("im.zego:zego_uikit_prebuilt_call_android:+")

    //DataStore
    implementation("androidx.datastore:datastore-preferences:1.2.0")

    implementation("androidx.security:security-crypto:1.1.0")

    implementation("com.google.crypto.tink:tink-android:1.20.0") // Or the latest stable version

    // TensorFlow Lite libraries
    implementation("org.tensorflow:tensorflow-lite:2.14.0")
    implementation("org.tensorflow:tensorflow-lite-support:0.4.4")
}