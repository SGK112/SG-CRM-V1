from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, List, Optional
import json
from datetime import datetime, timedelta
from .auth import get_current_user

router = APIRouter()

# Mock social media API integrations
class SocialMediaManager:
    def __init__(self):
        self.platforms = {
            'facebook': {'enabled': False, 'config': {}},
            'twitter': {'enabled': False, 'config': {}},
            'instagram': {'enabled': False, 'config': {}},
            'linkedin': {'enabled': False, 'config': {}},
            'youtube': {'enabled': False, 'config': {}}
        }
        self.campaigns = []
        self.posts = []
        self.analytics = {}

    def configure_platform(self, platform: str, config: Dict):
        """Configure social media platform settings"""
        if platform in self.platforms:
            self.platforms[platform]['config'] = config
            self.platforms[platform]['enabled'] = config.get('enabled', False)
            return {"status": "success", "message": f"{platform} configured successfully"}
        raise HTTPException(status_code=400, detail="Invalid platform")

    def create_post(self, content: str, platforms: List[str], schedule_time: Optional[datetime] = None):
        """Create and schedule social media posts"""
        post = {
            'id': len(self.posts) + 1,
            'content': content,
            'platforms': platforms,
            'schedule_time': schedule_time or datetime.now(),
            'status': 'scheduled' if schedule_time else 'published',
            'created_at': datetime.now(),
            'metrics': {'likes': 0, 'comments': 0, 'shares': 0, 'reach': 0}
        }
        self.posts.append(post)
        return post

    def get_analytics(self, platform: str = None, days: int = 30):
        """Get analytics for social media platforms"""
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        # Mock analytics data
        analytics = {
            'facebook': {
                'followers': 1234,
                'engagement_rate': 4.2,
                'reach': 5678,
                'posts': 23,
                'likes': 456,
                'comments': 89,
                'shares': 34
            },
            'twitter': {
                'followers': 890,
                'engagement_rate': 3.8,
                'reach': 3456,
                'posts': 45,
                'likes': 234,
                'comments': 67,
                'shares': 23
            },
            'instagram': {
                'followers': 2100,
                'engagement_rate': 5.1,
                'reach': 8901,
                'posts': 34,
                'likes': 678,
                'comments': 123,
                'shares': 45
            },
            'linkedin': {
                'followers': 567,
                'engagement_rate': 2.9,
                'reach': 2345,
                'posts': 12,
                'likes': 89,
                'comments': 23,
                'shares': 12
            }
        }
        
        if platform:
            return analytics.get(platform, {})
        return analytics

# Global instance
social_manager = SocialMediaManager()

@router.post("/platforms/{platform}/configure")
async def configure_platform(
    platform: str,
    config: Dict,
    current_user: dict = Depends(get_current_user)
):
    """Configure social media platform settings"""
    return social_manager.configure_platform(platform, config)

@router.get("/platforms")
async def get_platforms(current_user: dict = Depends(get_current_user)):
    """Get all platform configurations"""
    return social_manager.platforms

@router.post("/posts")
async def create_post(
    content: str,
    platforms: List[str],
    schedule_time: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Create and schedule social media posts"""
    schedule_dt = None
    if schedule_time:
        try:
            schedule_dt = datetime.fromisoformat(schedule_time)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid schedule time format")
    
    return social_manager.create_post(content, platforms, schedule_dt)

@router.get("/posts")
async def get_posts(current_user: dict = Depends(get_current_user)):
    """Get all social media posts"""
    return social_manager.posts

@router.get("/analytics")
async def get_analytics(
    platform: Optional[str] = None,
    days: int = 30,
    current_user: dict = Depends(get_current_user)
):
    """Get social media analytics"""
    return social_manager.get_analytics(platform, days)

@router.post("/campaigns")
async def create_campaign(
    name: str,
    description: str,
    budget: float,
    start_date: str,
    end_date: str,
    platforms: List[str],
    current_user: dict = Depends(get_current_user)
):
    """Create a new marketing campaign"""
    campaign = {
        'id': len(social_manager.campaigns) + 1,
        'name': name,
        'description': description,
        'budget': budget,
        'start_date': start_date,
        'end_date': end_date,
        'platforms': platforms,
        'status': 'active',
        'created_at': datetime.now().isoformat(),
        'metrics': {
            'impressions': 0,
            'clicks': 0,
            'conversions': 0,
            'cost_per_click': 0,
            'return_on_ad_spend': 0
        }
    }
    social_manager.campaigns.append(campaign)
    return campaign

@router.get("/campaigns")
async def get_campaigns(current_user: dict = Depends(get_current_user)):
    """Get all marketing campaigns"""
    return social_manager.campaigns

@router.put("/campaigns/{campaign_id}")
async def update_campaign(
    campaign_id: int,
    updates: Dict,
    current_user: dict = Depends(get_current_user)
):
    """Update a marketing campaign"""
    for campaign in social_manager.campaigns:
        if campaign['id'] == campaign_id:
            campaign.update(updates)
            return campaign
    raise HTTPException(status_code=404, detail="Campaign not found")

@router.delete("/campaigns/{campaign_id}")
async def delete_campaign(
    campaign_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Delete a marketing campaign"""
    social_manager.campaigns = [c for c in social_manager.campaigns if c['id'] != campaign_id]
    return {"message": "Campaign deleted successfully"}
