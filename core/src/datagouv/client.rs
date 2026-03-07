/// Client for datagouv-mcp public endpoint.
/// Used by the API backend to fetch live baremes from data.gouv.fr datasets.
/// In WASM/mobile: baremes are embedded (updated at build time from this same client).
///
/// MCP endpoint: https://mcp.data.gouv.fr/mcp
pub struct DatagouvClient {
    pub base_url: String,
}

impl Default for DatagouvClient {
    fn default() -> Self {
        Self {
            base_url: "https://mcp.data.gouv.fr/mcp".to_string(),
        }
    }
}

impl DatagouvClient {
    pub fn new(base_url: impl Into<String>) -> Self {
        Self { base_url: base_url.into() }
    }
}
