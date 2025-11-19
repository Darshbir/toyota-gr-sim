"""
Test script to verify Gemini API key works with a simplified prompt
similar to the actual F1 insights generation prompt.
"""

import os
import json
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()

def test_gemini_api():
    """Test Gemini API with a simplified F1 insights prompt"""
    
    # Get API key
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        print("❌ ERROR: GEMINI_API_KEY not found in environment variables or .env file")
        print("   Please set GEMINI_API_KEY in your .env file")
        return False
    
    print("✓ API key found")
    print(f"✓ API key length: {len(api_key)} characters")
    
    # Configure Gemini
    try:
        genai.configure(api_key=api_key)
        print("✓ Gemini API configured")
    except Exception as e:
        print(f"❌ ERROR configuring Gemini API: {e}")
        return False
    
    # Test with gemini-2.5-flash
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        print("✓ Model 'gemini-2.5-flash' loaded")
    except Exception as e:
        print(f"❌ ERROR loading model: {e}")
        return False
    
    # Create a simplified test prompt similar to the real one
    test_prompt = """You are an expert F1 race strategist analyzing race simulation data.

RACE SUMMARY:
- Total Laps: 36
- Race Duration: 3240 seconds
- Weather: Rain=0.15, Track Temp=25.0°C
- Winner: Max Verstappen

DRIVER DATA:
Max Verstappen (P1):
- Total Time: 3240s
- Laps Completed: 36
- Pit Stops: 2
- Pit Strategy: [{"lap": 12, "old_tyre": "SOFT", "new_tyre": "MEDIUM"}, {"lap": 24, "old_tyre": "MEDIUM", "new_tyre": "HARD"}]
- Tire Usage: {"SOFT": 12, "MEDIUM": 12, "HARD": 12}
- Fastest Lap: 85.234s (Lap 15)

Lewis Hamilton (P2):
- Total Time: 3250s
- Laps Completed: 36
- Pit Stops: 1
- Pit Strategy: [{"lap": 18, "old_tyre": "SOFT", "new_tyre": "HARD"}]
- Tire Usage: {"SOFT": 18, "HARD": 18}
- Fastest Lap: 85.456s (Lap 20)

ANALYSIS REQUIREMENTS:

Generate insights in JSON format for EACH driver:

{
  "Max Verstappen": {
    "pit_strategy_analysis": {
      "optimal_strategy": "2-stop",
      "optimal_strategy_confidence": 0.85,
      "strategy_efficiency_score": 0.90,
      "recommended_pit_laps": [12, 24],
      "recommended_tire_sequence": ["SOFT", "MEDIUM", "HARD"]
    },
    "overall_assessment": {
      "performance_score": 0.95,
      "strategy_score": 0.90,
      "execution_score": 0.92,
      "key_strengths": ["Excellent tire management", "Optimal pit timing"],
      "top_3_recommendations": [
        {
          "priority": 1,
          "category": "pit_strategy",
          "recommendation": "Strategy was optimal",
          "confidence": 0.85
        }
      ]
    }
  },
  "Lewis Hamilton": {
    "pit_strategy_analysis": {
      "optimal_strategy": "2-stop",
      "optimal_strategy_confidence": 0.75,
      "strategy_efficiency_score": 0.70,
      "recommended_pit_laps": [12, 24],
      "recommended_tire_sequence": ["SOFT", "MEDIUM", "HARD"]
    },
    "overall_assessment": {
      "performance_score": 0.88,
      "strategy_score": 0.70,
      "execution_score": 0.85,
      "key_strengths": ["Consistent pace"],
      "key_weaknesses": ["1-stop strategy was suboptimal"],
      "top_3_recommendations": [
        {
          "priority": 1,
          "category": "pit_strategy",
          "recommendation": "Should have used 2-stop strategy instead of 1-stop",
          "confidence": 0.80
        }
      ]
    }
  }
}

Output ONLY valid JSON, no additional text. Keep response concise."""
    
    print("\n📤 Sending test prompt to Gemini API...")
    print("   (This may take 10-30 seconds)")
    
    try:
        # Generate with timeout
        import signal
        
        def timeout_handler(signum, frame):
            raise TimeoutError("API call timed out after 60 seconds")
        
        # Set timeout for 60 seconds
        signal.signal(signal.SIGALRM, timeout_handler)
        signal.alarm(60)
        
        try:
            response = model.generate_content(test_prompt)
            signal.alarm(0)  # Cancel timeout
            
            print("✓ API response received")
            
            # Get response text
            insights_text = response.text
            print(f"✓ Response length: {len(insights_text)} characters")
            
            # Parse JSON
            insights_text = insights_text.strip()
            if insights_text.startswith('```json'):
                insights_text = insights_text[7:]
            if insights_text.startswith('```'):
                insights_text = insights_text[3:]
            if insights_text.endswith('```'):
                insights_text = insights_text[:-3]
            insights_text = insights_text.strip()
            
            insights = json.loads(insights_text)
            print("✓ JSON parsed successfully")
            print(f"✓ Found insights for {len(insights)} driver(s)")
            
            # Print summary
            print("\n📊 Summary:")
            for driver_name, driver_insights in insights.items():
                if 'overall_assessment' in driver_insights:
                    perf = driver_insights['overall_assessment'].get('performance_score', 0)
                    strat = driver_insights['overall_assessment'].get('strategy_score', 0)
                    print(f"  {driver_name}: Performance={perf:.2f}, Strategy={strat:.2f}")
            
            print("\n✅ API TEST PASSED - Gemini API is working correctly!")
            return True
            
        except TimeoutError:
            signal.alarm(0)
            print("❌ ERROR: API call timed out after 60 seconds")
            return False
        except json.JSONDecodeError as e:
            signal.alarm(0)
            print(f"❌ ERROR: Failed to parse JSON response: {e}")
            print(f"   Response preview: {insights_text[:200]}...")
            return False
            
    except Exception as e:
        signal.alarm(0)
        print(f"❌ ERROR generating content: {e}")
        print(f"   Error type: {type(e).__name__}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("Gemini API Test Script")
    print("=" * 60)
    print()
    
    success = test_gemini_api()
    
    print()
    print("=" * 60)
    if success:
        print("✅ All tests passed! API is ready to use.")
    else:
        print("❌ Tests failed. Please check your API key and try again.")
    print("=" * 60)




