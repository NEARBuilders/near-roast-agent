use std::path::PathBuf;
use async_trait::async_trait;
use tokio::spawn;
use inindexer::{
    near_utils::{TESTNET_GENESIS_BLOCK_HEIGHT},
    neardata::NeardataProvider,
    run_indexer, AutoContinue, BlockIterator, Indexer,
    IndexerOptions
};
use near_indexer_primitives::{types::AccountId, StreamerMessage, IndexerTransactionWithOutcome};
use reqwest::Client;
use serde_json::json;

struct WatcherIndexer {
    tracked_account: AccountId,
    http_client: Client,
}

static TRACKED_ACCOUNT: &str = "v0.near-roasts.testnet";
static RESPONDER_ACCOUNT: &str = "roast-daddy.near-roasts.testnet";
static API_URL: &str = "http://localhost:4555/v0/process";

#[async_trait]
impl Indexer for WatcherIndexer {
    type Error = String;

    async fn process_transaction(
        &mut self,
        transaction: &IndexerTransactionWithOutcome,
        _block: &StreamerMessage,
    ) -> Result<(), Self::Error> {
        // watching for calls to the yield-resume contract
        let is_tracked_account = transaction.transaction.receiver_id == self.tracked_account; // target contract
        let is_not_responder_account = transaction.transaction.signer_id != RESPONDER_ACCOUNT; // calls respond on contract from api

        if is_not_responder_account && is_tracked_account {
            log::info!(
                "Found transaction: https://testnet.nearblocks.io/txns/{}",
                transaction.transaction.hash
            );
            let http_client = self.http_client.clone();
            let request_id = transaction.transaction.signer_id.clone();

            // spawn a new asynchronous task to send the HTTP request
            spawn(async move {
                if let Err(e) = http_client
                    .post(API_URL)
                    .json(&json!({
                        "request_id": request_id,
                    }))
                    .send()
                    .await
                {
                    log::error!("Failed to send request {} to processing server: {}", request_id, e);
                }
            });
        }
        Ok(()) // continue running indexer
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    simple_logger::SimpleLogger::new()
        .with_level(log::LevelFilter::Info)
        .with_module_level("inindexer::performance", log::LevelFilter::Debug)
        .init()?;

    let mut indexer = WatcherIndexer {
        tracked_account: TRACKED_ACCOUNT.parse()?,
        http_client: Client::new(),
    };

    run_indexer(
        &mut indexer,
        // NeardataProvider::mainnet(),
        NeardataProvider::testnet(),
        IndexerOptions {
            range: BlockIterator::AutoContinue(AutoContinue {
                // save_location: Box::new(PathBuf::from("last_processed_block.txt")),
                // start_height_if_does_not_exist: 134_076_850, // Dec 2, 2024 (1:20 PM CT)
                // end: inindexer::AutoContinueEnd::Infinite,
                save_location: Box::new(PathBuf::from("last_processed_block.txt")),
                start_height_if_does_not_exist: 134_076_850, // Dec 2, 2024 (1:20 PM CT)
                end: inindexer::AutoContinueEnd::Infinite,
            }),
            stop_on_error: false,
            preprocess_transactions: None,
            // genesis_block_height: MAINNET_GENESIS_BLOCK_HEIGHT,
            genesis_block_height: TESTNET_GENESIS_BLOCK_HEIGHT,
            ctrl_c_handler: true,
        },
    )
    .await?;

    Ok(())
}
