export enum BotHooks {
    InitializeBot = 'BotHooks_InitializeBot',
    LocationLoaded = 'BotHooks_LocationLoaded',
    GetPlayerPosition = 'BotHooks_GetPlayerPosition',
    RotatePlayer = 'BotHooks_RotatePlayer'
  }
  
  export enum XRBotHooks {
    OverrideXR = 'XRBotHooks_OverrideXR',
    XRSupported = 'XRBotHooks_XRSupported',
    XRInitialized = 'XRBotHooks_XRInitialized',
    StartXR = 'XRBotHooks_StartXR',
    UpdateHead = 'XRBotHooks_UpdateHead',
    UpdateController = 'XRBotHooks_UpdateController',
    PressControllerButton = 'XRBotHooks_PressControllerButton',
    MoveControllerStick = 'XRBotHooks_MoveControllerStick',
    GetXRInputPosition = 'XRBotHooks_GetXRInputPosition',
    TweenXRInputSource = 'XRBotHooks_TweenXRInputSource'
  }
  