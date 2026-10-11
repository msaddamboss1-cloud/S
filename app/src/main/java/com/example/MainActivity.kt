package com.example

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.viewinterop.AndroidView
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContent {
      MyApplicationTheme {
        Surface(
          modifier = Modifier
            .fillMaxSize()
            .systemBarsPadding()
            .testTag("photonest_main_surface")
        ) {
          PhotoNestWebViewScreen()
        }
      }
    }
  }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun PhotoNestWebViewScreen() {
  var fileUploadCallback by remember { mutableStateOf<ValueCallback<Array<Uri>>?>(null) }
  var webViewRef by remember { mutableStateOf<WebView?>(null) }
  var canGoBack by remember { mutableStateOf(false) }

  val fileChooserLauncher = rememberLauncherForActivityResult(
    contract = ActivityResultContracts.StartActivityForResult()
  ) { result ->
    val uriResult = if (result.resultCode == Activity.RESULT_OK && result.data != null) {
      val data = result.data
      val clipData = data?.clipData
      if (clipData != null && clipData.itemCount > 0) {
        val uris = Array(clipData.itemCount) { i -> clipData.getItemAt(i).uri }
        uris
      } else if (data?.data != null) {
        arrayOf(data.data!!)
      } else {
        null
      }
    } else {
      null
    }
    fileUploadCallback?.onReceiveValue(uriResult)
    fileUploadCallback = null
  }

  BackHandler(enabled = canGoBack) {
    if (webViewRef?.canGoBack() == true) {
      webViewRef?.goBack()
    }
  }

  AndroidView(
    factory = { ctx ->
      WebView(ctx).apply {
        settings.apply {
          javaScriptEnabled = true
          domStorageEnabled = true
          databaseEnabled = true
          allowFileAccess = true
          allowContentAccess = true
          loadsImagesAutomatically = true
          useWideViewPort = true
          loadWithOverviewMode = true
          cacheMode = WebSettings.LOAD_DEFAULT
          mediaPlaybackRequiresUserGesture = false
        }

        webViewClient = object : WebViewClient() {
          override fun doUpdateVisitedHistory(view: WebView?, url: String?, isReload: Boolean) {
            super.doUpdateVisitedHistory(view, url, isReload)
            canGoBack = view?.canGoBack() ?: false
          }
        }

        webChromeClient = object : WebChromeClient() {
          override fun onShowFileChooser(
            webView: WebView?,
            filePathCallback: ValueCallback<Array<Uri>>?,
            fileChooserParams: FileChooserParams?
          ): Boolean {
            fileUploadCallback?.onReceiveValue(null)
            fileUploadCallback = filePathCallback
            val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
              addCategory(Intent.CATEGORY_OPENABLE)
              type = "image/*"
            }
            return try {
              fileChooserLauncher.launch(intent)
              true
            } catch (e: Exception) {
              fileUploadCallback?.onReceiveValue(null)
              fileUploadCallback = null
              false
            }
          }
        }

        loadUrl("file:///android_asset/web/index.html")
        webViewRef = this
      }
    },
    update = {
      webViewRef = it
    },
    modifier = Modifier
      .fillMaxSize()
      .testTag("photonest_webview")
  )
}
