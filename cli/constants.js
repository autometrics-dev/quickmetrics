export const METRICS_URL_NAME = "FP_METRICS_URL";
export const METRICS_TOKEN_NAME = "FP_METRICS_TOKEN";

export const METRICS_URL = "http://localhost:8063";
export const METRICS_TOKEN = "fp-Ooyoo-mei6a-egh4u-xooke";

export const YAML_TEMPLATE = `app_name: "<app>" # Becomes the job name when pushing to aggregation gateway
publish_method: "push"
scrape_config:
  scrape_interval: 500ms
  static_configs: # ignored when "publish_method" is "push" 
    - targets: ["localhost:8080"] # or wherever your app runs
`;
