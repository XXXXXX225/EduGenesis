# -*- coding: utf-8 -*-
import unittest
import json
from unittest.mock import patch, MagicMock
from app.models import UserProfile
from app.video_agent import (
    clean_html_tags,
    format_play_count,
    parse_duration_to_seconds,
    search_bilibili_videos,
    generate_video_recommendations,
    generate_optimized_search_query,
    select_and_recommend_videos,
    get_video_recommendations_for_node
)

class TestVideoAgent(unittest.TestCase):
    def test_clean_html_tags(self):
        self.assertEqual(clean_html_tags(""), "")
        self.assertEqual(clean_html_tags(None), "")
        self.assertEqual(
            clean_html_tags("Python <em class=\"keyword\">环境配置</em> 教程"),
            "Python 环境配置 教程"
        )

    def test_format_play_count(self):
        self.assertEqual(format_play_count(None), "0")
        self.assertEqual(format_play_count("15000000"), "1.5千万")
        self.assertEqual(format_play_count("12500"), "1.2万")
        self.assertEqual(format_play_count(500), "500")
        self.assertEqual(format_play_count("5.6万"), "5.6万")

    def test_parse_duration_to_seconds(self):
        self.assertEqual(parse_duration_to_seconds(""), 0)
        self.assertEqual(parse_duration_to_seconds(None), 0)
        self.assertEqual(parse_duration_to_seconds("02:44"), 164)
        self.assertEqual(parse_duration_to_seconds("10:24"), 624)
        self.assertEqual(parse_duration_to_seconds("1:12:30"), 4350)
        self.assertEqual(parse_duration_to_seconds("39:58:14"), 143894)
        self.assertEqual(parse_duration_to_seconds("invalid"), 0)

    @patch('app.video_agent.requests.get')
    def test_search_bilibili_videos_success(self, mock_get):
        # Mock successful Bilibili API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "code": 0,
            "data": {
                "result": [
                    {
                        "result_type": "video",
                        "data": [
                            {
                                "bvid": "BV1rpWjevEip",
                                "title": "Python <em class=\"keyword\">基础</em>",
                                "pic": "//i2.hdslb.com/bfs/archive/pic.jpg",
                                "author": "UP主",
                                "play": 15000,
                                "duration": "10:24",
                                "description": "一段描述"
                            }
                        ]
                    }
                ]
            }
        }
        mock_get.return_value = mock_response

        videos = search_bilibili_videos("变量")
        self.assertEqual(len(videos), 1)
        self.assertEqual(videos[0]["bvid"], "BV1rpWjevEip")
        self.assertEqual(videos[0]["title"], "Python 基础")
        self.assertEqual(videos[0]["pic"], "https://i2.hdslb.com/bfs/archive/pic.jpg")
        self.assertEqual(videos[0]["play"], "1.5万")

    @patch('app.video_agent.requests.get')
    def test_search_bilibili_videos_filtering(self, mock_get):
        # Mock API returning videos of different durations
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "code": 0,
            "data": {
                "result": [
                    {
                        "result_type": "video",
                        "data": [
                            {
                                "bvid": "BV_SHORT",
                                "title": "2分钟视频",
                                "pic": "",
                                "author": "UP主",
                                "play": 1000,
                                "duration": "02:00",
                                "description": "太短了"
                            },
                            {
                                "bvid": "BV_GOOD1",
                                "title": "8分钟干货",
                                "pic": "",
                                "author": "UP主",
                                "play": 2000,
                                "duration": "08:30",
                                "description": "正合适"
                            },
                            {
                                "bvid": "BV_GOOD2",
                                "title": "15分钟干货",
                                "pic": "",
                                "author": "UP主",
                                "play": 3000,
                                "duration": "15:00",
                                "description": "也很合适"
                            },
                            {
                                "bvid": "BV_LONG",
                                "title": "3小时课",
                                "pic": "",
                                "author": "UP主",
                                "play": 4000,
                                "duration": "03:00:00",
                                "description": "太长了"
                            }
                        ]
                    }
                ]
            }
        }
        mock_get.return_value = mock_response

        # Duration 08:30 (510s) and 15:00 (900s) should be preferred (5-20 mins)
        videos = search_bilibili_videos("过滤测试")
        self.assertEqual(len(videos), 2)
        bvids = [v["bvid"] for v in videos]
        self.assertIn("BV_GOOD1", bvids)
        self.assertIn("BV_GOOD2", bvids)
        self.assertNotIn("BV_SHORT", bvids)
        self.assertNotIn("BV_LONG", bvids)

    @patch('app.video_agent.requests.get')
    def test_search_bilibili_videos_strict_minimum_filtering(self, mock_get):
        # Mock API returning a 2-minute video and a 25-minute video
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "code": 0,
            "data": {
                "result": [
                    {
                        "result_type": "video",
                        "data": [
                            {
                                "bvid": "BV_TOO_SHORT",
                                "title": "2分钟视频",
                                "pic": "",
                                "author": "UP主",
                                "play": 1000,
                                "duration": "02:00",
                                "description": "太短了"
                            },
                            {
                                "bvid": "BV_RELAXED_GOOD",
                                "title": "25分钟干货",
                                "pic": "",
                                "author": "UP主",
                                "play": 2000,
                                "duration": "25:00",
                                "description": "偏长但有干货"
                            }
                        ]
                    }
                ]
            }
        }
        mock_get.return_value = mock_response

        # Duration 25:00 should be matched since we relax the maximum but strictly filter out < 5 mins
        videos = search_bilibili_videos("放宽测试")
        bvids = [v["bvid"] for v in videos]
        self.assertIn("BV_RELAXED_GOOD", bvids)
        self.assertNotIn("BV_TOO_SHORT", bvids)

    def test_generate_video_recommendations_fallback(self):
        # Test fallback rule engine when no API key is set
        profile = UserProfile(cognitive_style="Practical Coding")
        videos = [
            {
                "bvid": "BV1rpWjevEip",
                "title": "Python基础变量",
                "author": "UP主",
                "play": "1.5万",
                "duration": "10:24",
                "description": "描述"
            }
        ]
        
        with patch('app.video_agent.get_route_llm_params') as mock_llm_params:
            mock_llm_params.return_value = ("http://api.com", "", "model") # empty key
            
            result = generate_video_recommendations(videos, profile)
            self.assertEqual(len(result), 1)
            self.assertIn("实操编码风格", result[0]["recommend_reason"])

    @patch('app.video_agent.requests.post')
    def test_generate_optimized_search_query(self, mock_post):
        # Mock LLM API parameters
        with patch('app.video_agent.get_route_llm_params') as mock_llm_params:
            mock_llm_params.return_value = ("http://api.com", "fake_key", "model")
            
            # Mock successful response
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = {
                "choices": [{"message": {"content": "Python Socket 教程"}}]
            }
            mock_post.return_value = mock_response

            query = generate_optimized_search_query("Python网络编程", "套接字TCP连接说明")
            self.assertEqual(query, "Python Socket 教程")

    @patch('app.video_agent.requests.post')
    def test_select_and_recommend_videos_llm(self, mock_post):
        # Mock LLM API parameters
        with patch('app.video_agent.get_route_llm_params') as mock_llm_params:
            mock_llm_params.return_value = ("http://api.com", "fake_key", "model")
            
            # Mock LLM JSON output response
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = {
                "choices": [{
                    "message": {
                        "content": json.dumps({
                            "selected_indices": [0],
                            "reasons": ["这视频很好，适合你的视觉风格。"]
                        })
                    }
                }]
            }
            mock_post.return_value = mock_response

            profile = UserProfile(cognitive_style="Visual Guided")
            videos = [
                {
                    "bvid": "BV_TEST",
                    "title": "Socket编程讲解",
                    "author": "UP主",
                    "play": "1万",
                    "duration": "12:30",
                    "description": "介绍"
                }
            ]

            selected = select_and_recommend_videos(videos, "标题", "描述", profile)
            self.assertEqual(len(selected), 1)
            self.assertEqual(selected[0]["bvid"], "BV_TEST")
            self.assertEqual(selected[0]["recommend_reason"], "这视频很好，适合你的视觉风格。")

if __name__ == "__main__":
    unittest.main()
