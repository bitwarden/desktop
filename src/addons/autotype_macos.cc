#include <node.h>
#include <Carbon/Carbon.h>

namespace AutoTypeMacOS {

  using v8::FunctionCallbackInfo;
  using v8::Isolate;
  using v8::Local;
  using v8::Object;
  using v8::String;
  using v8::Value;
  using v8::Context;

  Local<Context> GetContext(const FunctionCallbackInfo<Value>& args){
    Isolate* isolate = args.GetIsolate();
    return isolate->GetCurrentContext();
  }

  void TypeString(const FunctionCallbackInfo<Value>& args) {
    Isolate* isolate = args.GetIsolate();
    
    if (args.Length() == 1) {
      if (args[0]->IsString()) {
        
        v8::String::Utf8Value strParam(isolate, args[0]);
        std::string str(*strParam);
        
        for(unsigned long i=0; i< str.length(); i++){

          CGEventRef keyEvent = CGEventCreateKeyboardEvent(NULL, 0, true);
          if (keyEvent != NULL) {
              uint32_t codepoint = str.at(i);

              if ((codepoint & 0xfc00) == 0xd800) {
                uint16 ch2 = str.at(i + 1);
                codepoint = (((codepoint & 0x3ff) << 10) | (ch2 & 0x3ff)) + 0x10000;
              }
              
              uint16 u = (uint16)codepoint;
              
              CGEventKeyboardSetUnicodeString(keyEvent, 1, &u);
              CGEventPost(kCGHIDEventTap, keyEvent);
              CFRelease(keyEvent);
          }
        }

      }
    }
    args.GetReturnValue().Set(args.This());
  }

  // Send an event specifying if the key is up or down
  void _keyEvent(CGKeyCode keyCode, bool isDown){
    CGEventRef keyEvent = CGEventCreateKeyboardEvent(NULL,keyCode , isDown);
    CGEventPost(kCGHIDEventTap, keyEvent);
    CFRelease(keyEvent);
  } 

  void KeyEvent(const FunctionCallbackInfo<Value>& args){
    Local<Context> context = GetContext(args);

    if (args.Length() == 2) {
      if (args[0]->IsNumber() && args[1]->IsBoolean()) {
        _keyEvent(args[0]->NumberValue(context).FromMaybe(0), args[1]->BooleanValue(args.GetIsolate()));
      }
    }
  }

  void _keyDown(CGKeyCode keyCode){
      _keyEvent(keyCode, true);
  }

  void KeyDown(const FunctionCallbackInfo<Value>& args){
    Local<Context> context = GetContext(args);

    if (args.Length() == 1) {
      if (args[0]->IsNumber()) {
        _keyDown(args[0]->NumberValue(context).FromMaybe(0));
      }
    }
  }
  

  void _keyUp(CGKeyCode keyCode){
      _keyEvent(keyCode, false);
  }

  void KeyUp(const FunctionCallbackInfo<Value>& args){
    Local<Context> context = GetContext(args);

    if (args.Length() == 1) {
      if (args[0]->IsNumber()) {
        _keyUp(args[0]->NumberValue(context).FromMaybe(0));
      }
    }
  }

  void _keyPress(CGKeyCode keyCode){
      _keyDown(keyCode);
      _keyUp(keyCode);
  }

  void KeyPress(const FunctionCallbackInfo<Value>& args){
    Local<Context> context = GetContext(args);

    if (args.Length() == 1) {
      if (args[0]->IsNumber()) {
        _keyPress(args[0]->NumberValue(context).FromMaybe(0));
      }
    }
  }

  void Enter(const FunctionCallbackInfo<Value>& args){_keyPress(kVK_Return);}
  void Tab(const FunctionCallbackInfo<Value>& args){_keyPress(kVK_Tab);}

  void SwitchWindow(const FunctionCallbackInfo<Value>& args){
    // sending command down, pressing tab and sending command up doesn't work
    // and stupidely enough the command needs to be release even when used as a modifier key
    // this method can still be improved... since we need to set the modifier key up we can do a switch for all modifiers

    CGEventSourceRef source = CGEventSourceCreate (kCGEventSourceStateCombinedSessionState);

    CGEventRef commandTabDown = CGEventCreateKeyboardEvent(source,kVK_Tab , true);
    CGEventSetFlags(commandTabDown, kCGEventFlagMaskCommand  | CGEventGetFlags(commandTabDown));
    CGEventPost(kCGHIDEventTap, commandTabDown);
    
    CGEventRef commandTabUp = CGEventCreateKeyboardEvent(source,kVK_Tab , false);
    CGEventSetFlags(commandTabUp, kCGEventFlagMaskCommand| CGEventGetFlags(commandTabUp));
    CGEventPost(kCGHIDEventTap, commandTabUp);
    
    CGEventRef commandUp = CGEventCreateKeyboardEvent(source,kVK_Command , false);
    CGEventPost(kCGHIDEventTap, commandUp);

    CFRelease(commandTabUp);
    CFRelease(commandTabDown);
    CFRelease(commandUp);
  }

  void Initialize(Local<Object> exports) {
    NODE_SET_METHOD(exports, "TypeString", TypeString);
    NODE_SET_METHOD(exports, "Enter", Enter);
    NODE_SET_METHOD(exports, "Tab", Tab);
    NODE_SET_METHOD(exports, "KeyEvent", KeyEvent);
    NODE_SET_METHOD(exports, "KeyUp", KeyUp);
    NODE_SET_METHOD(exports, "KeyDown", KeyDown);
    NODE_SET_METHOD(exports, "KeyPress", KeyPress);
    NODE_SET_METHOD(exports, "SwitchWindow", SwitchWindow);
  }

  NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)
}