use murmurhash32::murmurhash2;
use napi::bindgen_prelude::*;
use napi_derive::napi;
use std::io::Read;

// Here for sentimental reasons.
#[allow(dead_code)]
#[napi]
fn fibonacci(n: u32) -> u32 {
    match n {
        1 | 2 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

#[allow(dead_code)]
#[napi]
async fn compute_path_murmur(path: String) -> Result<u32> {
    let mut file = std::fs::File::open(path)?;
    let mut buffer = Vec::new();
    file.read_to_end(&mut buffer)?;
    buffer.retain(|&x| (x != 9 && x != 10 && x != 13 && x != 32));
    let hash = murmurhash2(&buffer);
    Ok(hash)
}
