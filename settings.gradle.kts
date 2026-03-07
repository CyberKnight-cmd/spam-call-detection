pluginManagement {
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        maven ( "https://maven.zego.im")   // <- Add this line.
        maven ( "https://www.jitpack.io" ) // <- Add this line.
        google()
        mavenCentral()
    }
}

rootProject.name = "Skeleton"
include(":app")
 