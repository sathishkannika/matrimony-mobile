import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "matrimony_mobile",
      in: window,
      launchOptions: launchOptions
    )

    // iOS cannot FLAG_SECURE-block screenshots (Apple forbids it). Black out the app-switcher
    // preview and screen-recording capture so photos/OTPs are not sitting in the recents tray.
    NotificationCenter.default.addObserver(
      forName: UIApplication.willResignActiveNotification,
      object: nil,
      queue: .main
    ) { [weak self] _ in
      self?.showPrivacyOverlay()
    }
    NotificationCenter.default.addObserver(
      forName: UIApplication.didBecomeActiveNotification,
      object: nil,
      queue: .main
    ) { [weak self] _ in
      self?.hidePrivacyOverlay()
    }
    NotificationCenter.default.addObserver(
      forName: UIScreen.capturedDidChangeNotification,
      object: nil,
      queue: .main
    ) { [weak self] _ in
      if UIScreen.main.isCaptured {
        self?.showPrivacyOverlay()
      } else if UIApplication.shared.applicationState == .active {
        self?.hidePrivacyOverlay()
      }
    }

    return true
  }

  private let privacyOverlayTag = 9101

  private func showPrivacyOverlay() {
    guard let window, window.viewWithTag(privacyOverlayTag) == nil else { return }
    let overlay = UIView(frame: window.bounds)
    overlay.autoresizingMask = [.flexibleWidth, .flexibleHeight]
    overlay.backgroundColor = UIColor(red: 0.988, green: 0.980, blue: 0.973, alpha: 1)
    overlay.tag = privacyOverlayTag
    overlay.isUserInteractionEnabled = true
    window.addSubview(overlay)
  }

  private func hidePrivacyOverlay() {
    window?.viewWithTag(privacyOverlayTag)?.removeFromSuperview()
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
