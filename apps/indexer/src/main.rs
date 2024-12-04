use std::path::PathBuf;
use async_trait::async_trait;
use inindexer::{
    near_utils::{TESTNET_GENESIS_BLOCK_HEIGHT},
    neardata::NeardataProvider,
    run_indexer, AutoContinue, BlockIterator, Indexer,
    IndexerOptions, PreprocessTransactionsSettings
};
use near_indexer_primitives::{types::AccountId, StreamerMessage, IndexerTransactionWithOutcome};
use reqwest::Client;
use serde_json::json;

struct WatcherIndexer {
    tracked_account: AccountId,
    http_client: Client,
}

#[async_trait]
impl Indexer for WatcherIndexer {
    type Error = String;

    async fn process_transaction(
        &mut self,
        transaction: &IndexerTransactionWithOutcome,
        _block: &StreamerMessage,
    ) -> Result<(), Self::Error> {
        // watching for calls to the yield-resume contract
        if transaction.transaction.receiver_id == self.tracked_account {
            log::info!(
                "Found transaction: https://testnet.nearblocks.io/txns/{}",
                transaction.transaction.hash
            );

            let response = self.http_client
                .post("http://localhost:4555/v0/process") 
                .json(&json!({
                    "signer_id": transaction.transaction.signer_id,
                }))
                .send()
                .await
                .map_err(|e| e.to_string())?;

            if !response.status().is_success() {
                log::error!("Failed to process for signer: {}", transaction.transaction.signer_id);
            }
        }
        Ok(())
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    simple_logger::SimpleLogger::new()
        .with_level(log::LevelFilter::Info)
        .with_module_level("inindexer::performance", log::LevelFilter::Debug)
        .init()?;

    let mut indexer = WatcherIndexer {
        // tracked_account: "efiz.near".parse()?,
        tracked_account: "v0.near-roasts.testnet".parse()?,
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
            preprocess_transactions: Some(PreprocessTransactionsSettings::default()),
            // genesis_block_height: MAINNET_GENESIS_BLOCK_HEIGHT,
            genesis_block_height: TESTNET_GENESIS_BLOCK_HEIGHT,
            ctrl_c_handler: true,
        },
    )
    .await?;

    Ok(())
}
