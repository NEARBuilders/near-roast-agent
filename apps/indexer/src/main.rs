use std::path::PathBuf;
use async_trait::async_trait;
use inindexer::{
    near_utils::{MAINNET_GENESIS_BLOCK_HEIGHT},
    neardata::NeardataProvider,
    run_indexer, AutoContinue, BlockIterator, CompleteTransaction, Indexer,
    IndexerOptions,
};
use near_indexer_primitives::{types::AccountId, StreamerMessage};

struct WatcherIndexer {
    tracked_account: AccountId,
}

#[async_trait]
impl Indexer for WatcherIndexer {
    type Error = String;

    async fn on_transaction(
        &mut self,
        transaction: &CompleteTransaction,
        _block: &StreamerMessage,
    ) -> Result<(), Self::Error> {
        // Note: this is a simple example, which doesn't handle DELEGATE actions
        if transaction.transaction.transaction.signer_id.to_string() == self.tracked_account {
            log::info!(
                "Found transaction: https://pikespeak.ai/transaction-viewer/{}",
                transaction.transaction.transaction.hash
            );
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
        tracked_account: "slimedragon.near".parse()?,
    };

    run_indexer(
        &mut indexer,
        NeardataProvider::mainnet(),
        IndexerOptions {
            range: BlockIterator::AutoContinue(AutoContinue {
                save_location: Box::new(PathBuf::from("last_processed_block.txt")),
                start_height_if_does_not_exist: 134_076_850, // Dec 2, 2024 (1:20 PM CT)
                end: inindexer::AutoContinueEnd::Infinite,
            }),
            stop_on_error: false,
            preprocess_transactions: None,
            genesis_block_height: MAINNET_GENESIS_BLOCK_HEIGHT,
            ctrl_c_handler: true,
        },
    )
    .await?;

    Ok(())
}
