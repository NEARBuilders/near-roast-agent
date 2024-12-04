use near_sdk::store::IterableMap;
use near_sdk::{
    env, near, serde_json, BorshStorageKey, CryptoHash, Gas, GasWeight, PromiseError,
};
use serde_json::json;

const YIELD_REGISTER: u64 = 0;

#[near]
#[derive(BorshStorageKey)]
enum Keys {
    Map,
}

#[near(serializers = [json, borsh])]
#[derive(Clone)]
pub struct Request {
    yield_id: CryptoHash,
    prompt: String,
}

#[near(serializers = [json])]
pub enum Response {
    Answer(String),
    TimeOutError,
}

#[near(contract_state)]
pub struct Contract {
    requests: IterableMap<String, Request>,
}

impl Default for Contract {
    fn default() -> Self {
        Self {
            requests: IterableMap::new(Keys::Map),
        }
    }
}

#[near]
impl Contract {
    pub fn request(&mut self, prompt: String) {
        // use the signer_id as the key
        let signer_id = env::predecessor_account_id().to_string();

        // check if signer already has a pending request
        if self.requests.contains_key(&signer_id) {
            env::panic_str("Request already in progress for this signer");
        }

        // idk if signer is the best request key
        let request_id = signer_id;

        // this will create a unique ID in the YIELD_REGISTER
        let yield_promise = env::promise_yield_create(
            "return_external_response",
            &json!({ "request_id": request_id }).to_string().into_bytes(),
            Gas::from_tgas(5),
            GasWeight::default(),
            YIELD_REGISTER,
        );

        // load the ID created by the promise_yield_create
        let yield_id: CryptoHash = env::read_register(YIELD_REGISTER)
            .expect("read_register failed")
            .try_into()
            .expect("conversion to CryptoHash failed");

        // store the request, so we can delete it later
        let request = Request { yield_id, prompt };
        self.requests.insert(request_id, request);

        // return the yield promise
        env::promise_return(yield_promise);
    }

    pub fn respond(&mut self, yield_id: CryptoHash, response: String) { 
        // resume computation with the response
        env::promise_yield_resume(&yield_id, &serde_json::to_vec(&response).unwrap());
    }

    pub fn get_request(&self, request_id: String) -> Option<Request> {
        self.requests.get(&request_id.to_string()).cloned()
    }

    #[private]
    pub fn return_external_response(
        &mut self,
        request_id: String,
        #[callback_result] response: Result<String, PromiseError>,
    ) -> Response {
        self.requests.remove(&request_id.to_string());

        match response {
            Ok(answer) => Response::Answer(answer),
            Err(_) => Response::TimeOutError,
        }
    }

    // helper function, lists pending requests
    pub fn list_requests(&self) -> Vec<Request> {
        self.requests
            .values()
            .map(|request| request.clone())
            .collect()
    }

    // requests delete on their own after a time-out, but if needed to kill early
    pub fn delete_request(&mut self, request_id: String) -> String {
        // Check if the request exists
        if !self.requests.contains_key(&request_id) {
            return "Request not found".to_string();
        }

        // Check if caller has access (must be contract account)
        if env::predecessor_account_id() != env::current_account_id() {
            return "Calling account does not have access".to_string();
        }

        // Remove the request and return success
        self.requests.remove(&request_id);
        "Request successfully deleted".to_string()
    }
}
