use neon::prelude::*;
use tokio::runtime::Runtime;

mod biometric;

fn hello(mut cx: FunctionContext) -> JsResult<JsString> {
    Ok(cx.string("hello node"))
}

fn supports_biometric(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let promise = cx
        .task(move || Runtime::new().unwrap().block_on(biometric::available()))
        .promise(|mut cx, n| Ok(cx.boolean(n)));

    Ok(promise)
}

fn verify(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let promise = cx
        .task(move || biometric::verify())
        .promise(|mut cx, n| Ok(cx.boolean(n)));

    Ok(promise)
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("verify", verify)?;
    cx.export_function("supportsBiometric", supports_biometric)?;
    Ok(())
}
