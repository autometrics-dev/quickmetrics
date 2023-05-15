
export async function queryPrometheus() {
  const prometheusUrl = "http://localhost:8063/api/v1/query";
  const query = "prometheus_http_requests_total";

  const requestOptions: RequestInit = {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `query=${encodeURIComponent(query)}`,
  };

  try {
    const response = await fetch(prometheusUrl, requestOptions);
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(`Request failed with status ${response.status}`);
    }
  } catch (error) {
    console.error("An error occurred while making the request:", error);
    throw error;
  }
}