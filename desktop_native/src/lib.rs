use neon::prelude::*;
use tokio::runtime::Runtime;

mod biometric;

fn supports_biometric(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let promise = cx
        .task(move || Runtime::new().unwrap().block_on(biometric::available()))
        .promise(|mut cx, n| Ok(cx.boolean(n)));

    Ok(promise)
}

fn verify(mut cx: FunctionContext) -> JsResult<JsPromise> {
    let message = cx.argument::<JsString>(0)?.value(&mut cx);
    let window_handle = cx.argument::<JsNumber>(1)?.value(&mut cx) as isize;

    let promise = cx
        .task(move || {
            Runtime::new()
                .unwrap()
                .block_on(biometric::verify(&message, window_handle))
                .unwrap()
        })
        .promise(|mut cx, n| Ok(cx.boolean(n)));

    Ok(promise)
}

#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("verify", verify)?;
    cx.export_function("supportsBiometric", supports_biometric)?;
    Ok(())
}
