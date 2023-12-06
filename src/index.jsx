import React, { useState } from "react";
import ReactDOM from "react-dom";

function App() {
  const urlList = [
    {
      name: "【vecel反代线路】",
      value: "https://proxy.vercel.iamrazo.pro/api.openai.com",
    },
    {
      name: "【官网线路】",
      value: "https://api.openai.com",
    },
    {
      name: "自定义 ...",
      value: "custom",
    },
  ];
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [apiUrlSelect, setApiUrlSelect] = useState(urlList[0].value);
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState([]);

  const handleApiKeyChange = (event) => {
    setApiKeyInput(event.target.value);
  };

  const handleApiUrlChange = (event) => {
    setApiUrlSelect(event.target.value);
  };

  const handleCustomUrlChange = (event) => {
    setCustomUrlInput(event.target.value);
  };

  const sendRequest = async () => {
    setLoading(true);
    setResult([]);

    if (apiKeyInput.trim() === "") {
      alert("请填写API KEY");
      setLoading(false);
      return;
    }

    let apiUrl = "";
    if (apiUrlSelect === "custom") {
      if (customUrlInput.trim() === "") {
        alert("请设置API链接");
        setLoading(false);
        return;
      } else {
        apiUrl = customUrlInput.trim();
        if (!apiUrl.startsWith("http://") && !apiUrl.startsWith("https://")) {
          apiUrl = "https://" + apiUrl;
        }
      }
    } else {
      apiUrl = apiUrlSelect;
    }

    const apiKeys = apiKeyInput.split(",");
    if (apiKeys.length === 0) {
      alert("未匹配到 API-KEY，请检查输入内容");
      setLoading(false);
      return;
    }

    alert("成功匹配到 API Key，确认后开始查询：" + apiKeys);

    try {
      const queriedApiKeys = await Promise.all(
        apiKeys.map((apiKey) =>
          checkBilling(apiKey, apiUrl).catch(() => {
            /**
             *
             */
          }),
        ),
      );
      setResult(queriedApiKeys.filter(Boolean));
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  };

  const checkBilling = async (apiKey, apiUrl) => {
    const now = new Date();
    const startDate = new Date(now - 90 * 24 * 60 * 60 * 1000);
    const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const subDate = new Date(now);
    subDate.setDate(1);

    const headers = {
      Authorization: "Bearer " + apiKey,
      "Content-Type": "application/json",
    };
    const gpt4Check = `${apiUrl}/v1/models`;
    const urlSubscription = `${apiUrl}/v1/dashboard/billing/subscription`;
    let urlUsage = `${apiUrl}/v1/dashboard/billing/usage?start_date=${formatDate(
      startDate,
    )}&end_date=${formatDate(endDate)}`;

    const response = await fetch(urlSubscription, { headers });
    if (!response.ok) {
      return {
        apiKey,
        error: "APIKEY 错误或账号被封，请登录 OpenAI 查看。",
      };
    }

    const currentDate = new Date();
    const subscriptionData = await response.json();
    const totalAmount = subscriptionData.system_hard_limit_usd;
    const expiryDate = new Date(
      subscriptionData.access_until * 1000 + 8 * 60 * 60 * 1000,
    );
    const formattedDate = `${expiryDate.getFullYear()}-${(
      expiryDate.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}-${expiryDate.getDate().toString().padStart(2, "0")}`;

    const gpt4CheckResponse = await fetch(gpt4Check, { headers });
    const gpt4CheckData = await gpt4CheckResponse.json();
    const isGPT4 =
      Array.isArray(gpt4CheckData.data) &&
      gpt4CheckData.data.some((item) => item.id.includes("gpt-4"));
    const isSubscrible = subscriptionData.plan.id.includes("payg");

    if (totalAmount > 20) {
      urlUsage = `${apiUrl}/v1/dashboard/billing/usage?start_date=${formatDate(
        subDate,
      )}&end_date=${formatDate(endDate)}`;
    }

    const usageResponse = await fetch(urlUsage, { headers });
    const usageData = await usageResponse.json();
    const totalUsage = usageData.total_usage / 100;
    const remaining = subscriptionData.system_hard_limit_usd - totalUsage;
    const isExpired = currentDate > expiryDate;

    return {
      apiKey,
      totalAmount,
      totalUsage,
      remaining,
      formattedDate,
      isExpired,
      isGPT4,
      isSubscrible,
    };
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const maskAPIKey = (apiKey) => {
    const strList = apiKey.split("");
    const start = 0 + 8;
    const end = Math.max(strList.length - 1 - 5, start);

    return strList
      .map((it, index) => {
        if (index > start && index < end) return "";
        if (index === start || index === end) return "*";
        return it;
      })
      .join("");
  };

  return (
    <div>
      <header>
        <h1 className="text-3xl font-semibold text-center mb-8 text-gradient">
          查询 OpenAI 账单
        </h1>
      </header>
      <h2>输入 API KEY</h2>
      <textarea
        id="api-key-input"
        placeholder="请输入 API-KEY，多个请用英文逗号,隔开"
        value={apiKeyInput}
        onChange={handleApiKeyChange}
      ></textarea>
      <h2>选择查询线路</h2>
      <p>支持自定义线路</p>
      <select
        id="api-url-select"
        value={apiUrlSelect}
        onChange={handleApiUrlChange}
      >
        {urlList.map(({ name, value }) => (
          <option value={value}>{name}</option>
        ))}
      </select>
      {apiUrlSelect === "custom" && (
        <input
          type="text"
          id="custom-url-input"
          placeholder="输入自定义API，默认使用 https 协议"
          value={customUrlInput}
          onChange={handleCustomUrlChange}
        />
      )}
      <button
        className={loading ? "loading" : ""}
        disabled={loading}
        onClick={sendRequest}
      >
        查询
      </button>

      {result.length > 0 && (
        <>
          <h2 id="result-head">查询结果</h2>

          <div
            id="result-table-container"
            style={{ width: "100%", overflowX: "auto" }}
          >
            <table id="result-table">
              <thead>
                <tr>
                  <th>API KEY</th>
                  <th>总额度</th>
                  <th>已使用</th>
                  <th>剩余量</th>
                  <th>到期时间</th>
                  <th>GPT-4</th>
                  <th>是否绑卡</th>
                </tr>
              </thead>
              <tbody>
                {result.map((item, index) => (
                  <tr key={index}>
                    {item.error ? (
                      <>
                        <td>{maskAPIKey(item.apiKey)}</td>
                        <td colSpan={6}>{item.error}</td>
                      </>
                    ) : (
                      <>
                        <td>{maskAPIKey(item.apiKey)}</td>
                        <td>{item.totalAmount.toFixed(2)}</td>
                        <td>{item.totalUsage.toFixed(2)}</td>
                        <td>{item.remaining.toFixed(2)}</td>
                        <td>
                          {item.formattedDate}{" "}
                          {item.isExpired ? "(🔴)" : "(🟢)"}
                        </td>
                        <td>{item.isGPT4 ? "✅" : "❌"}</td>
                        <td>{item.isSubscrible ? "🟢" : "🔴"}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));
