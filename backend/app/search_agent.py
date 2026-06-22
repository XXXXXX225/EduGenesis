import os
import re
import urllib.parse
import requests
from html import unescape

def search_duckduckgo(query: str, max_results: int = 3) -> list:
    url = "https://lite.duckduckgo.com/lite/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {
        "q": query
    }
    try:
        response = requests.post(url, headers=headers, data=data, timeout=5)
        if response.status_code == 200:
            html = response.text
            snippets = re.findall(r'<td class="result-snippet"[^>]*>(.*?)</td>', html, re.DOTALL)
            links_titles = re.findall(r'<a[^>]+rel="nofollow"[^>]+href="([^"]+)"[^>]*>(.*?)</a>', html, re.DOTALL)
            
            def clean_html(text):
                text = re.sub(r'<[^>]+>', '', text)
                text = text.replace('\n', ' ').replace('\r', '')
                return unescape(text.strip())
            
            results = []
            count = min(len(snippets), len(links_titles))
            for i in range(count):
                if len(results) >= max_results:
                    break
                link, title = links_titles[i]
                snippet = snippets[i]
                
                # Filter out DDG internal links
                if "duckduckgo.com" in link and not link.startswith("https://duckduckgo.com/y.js"):
                    continue
                
                if "uddg=" in link:
                    parsed_url = urllib.parse.urlparse(link)
                    query_params = urllib.parse.parse_qs(parsed_url.query)
                    if "uddg" in query_params:
                        link = query_params["uddg"][0]
                
                results.append({
                    "title": clean_html(title),
                    "link": link,
                    "snippet": clean_html(snippet)
                })
            return results
    except Exception as e:
        print(f"[DuckDuckGo Search Error] {e}")
    return []

def search_tavily(query: str, api_key: str, max_results: int = 3) -> list:
    url = "https://api.tavily.com/search"
    payload = {
        "api_key": api_key,
        "query": query,
        "max_results": max_results,
        "search_depth": "light"
    }
    try:
        response = requests.post(url, json=payload, timeout=6)
        if response.status_code == 200:
            data = response.json()
            results = []
            for r in data.get("results", [])[:max_results]:
                results.append({
                    "title": r.get("title", ""),
                    "link": r.get("url", ""),
                    "snippet": r.get("content", "")
                })
            return results
    except Exception as e:
        print(f"[Tavily Search Error] {e}")
    return []

def search_google(query: str, api_key: str, max_results: int = 3) -> list:
    cx = os.getenv("GOOGLE_CX", "")
    if cx and api_key:
        url = f"https://www.googleapis.com/customsearch/v1?key={api_key}&cx={cx}&q={urllib.parse.quote(query)}"
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                results = []
                for item in data.get("items", [])[:max_results]:
                    results.append({
                        "title": item.get("title", ""),
                        "link": item.get("link", ""),
                        "snippet": item.get("snippet", "")
                    })
                return results
        except Exception as e:
            print(f"[Google Search Error] {e}")
    # Fallback to DuckDuckGo
    return search_duckduckgo(query, max_results)

def run_web_search(query: str, provider: str = "duckduckgo", api_key: str = "", max_results: int = 3) -> list:
    if provider == "tavily" and api_key:
        return search_tavily(query, api_key, max_results)
    elif provider == "google" and api_key:
        return search_google(query, api_key, max_results)
    else:
        return search_duckduckgo(query, max_results)
