import requests
import sys
from datetime import datetime
import subprocess
import time

class PoncikFocusAPITester:
    def __init__(self, base_url="https://focus-credits.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session_token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        test_headers = {'Content-Type': 'application/json'}
        
        # Add auth headers
        if self.session_token:
            test_headers['Authorization'] = f'Bearer {self.session_token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if response.headers.get('content-type', '').startswith('application/json'):
                    try:
                        return success, response.json()
                    except:
                        return success, {}
                else:
                    return success, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                if response.headers.get('content-type', '').startswith('application/json'):
                    try:
                        error_data = response.json()
                        print(f"   Error: {error_data}")
                        return False, error_data
                    except:
                        print(f"   Response: {response.text}")
                        return False, response.text
                else:
                    print(f"   Response: {response.text}")
                    return False, response.text

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def create_test_user_session(self):
        """Create test user and session in MongoDB using mongosh"""
        print("\n🔧 Creating test user and session in MongoDB...")
        
        timestamp = int(time.time())
        self.user_id = f"test-user-{timestamp}"
        self.session_token = f"test_session_{timestamp}"
        
        mongosh_script = f"""
use('test_database');
var userId = '{self.user_id}';
var sessionToken = '{self.session_token}';
db.users.insertOne({{
  user_id: userId,
  email: 'test.user.{timestamp}@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  credits: 100,
  level: 2,
  xp: 500,
  streak_days: 3,
  total_focus_minutes: 60,
  owned_items: [],
  active_theme: 'light',
  language: 'tr',
  created_at: new Date().toISOString()
}});
db.user_sessions.insertOne({{
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
  created_at: new Date().toISOString()
}});
print('✅ Test user and session created successfully');
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"""
        
        try:
            result = subprocess.run(['mongosh', '--eval', mongosh_script], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                print("✅ Test user and session created successfully")
                print(f"   User ID: {self.user_id}")
                print(f"   Session Token: {self.session_token}")
                return True
            else:
                print(f"❌ Failed to create test user: {result.stderr}")
                return False
        except Exception as e:
            print(f"❌ Error creating test user: {str(e)}")
            return False

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_shop_items(self):
        """Test shop items endpoint"""
        success, response = self.run_test(
            "Shop Items",
            "GET", 
            "shop/items",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} shop items")
        return success

    def test_music_tracks(self):
        """Test music tracks endpoint"""
        success, response = self.run_test(
            "Music Tracks",
            "GET",
            "music/tracks", 
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} music tracks")
        return success

    def test_badges(self):
        """Test badges endpoint"""
        success, response = self.run_test(
            "Badges List",
            "GET",
            "badges",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} badges")
        return success

    def test_auth_me(self):
        """Test auth me endpoint"""
        success, response = self.run_test(
            "Auth Me",
            "GET",
            "auth/me",
            200
        )
        if success:
            print(f"   User: {response.get('name', 'Unknown')}")
            print(f"   Credits: {response.get('credits', 0)}")
        return success

    def test_todos_crud(self):
        """Test todos CRUD operations"""
        # Get todos
        success, todos = self.run_test("Get Todos", "GET", "todos", 200)
        if not success:
            return False
        
        initial_count = len(todos) if isinstance(todos, list) else 0
        print(f"   Initial todos: {initial_count}")
        
        # Create todo
        todo_data = {"text": f"Test todo - {datetime.now().strftime('%H:%M:%S')}"}
        success, new_todo = self.run_test(
            "Create Todo", "POST", "todos", 201, todo_data
        )
        if not success:
            return False
        
        todo_id = new_todo.get('todo_id')
        print(f"   Created todo: {todo_id}")
        
        # Update todo
        update_data = {"completed": True}
        success, updated_todo = self.run_test(
            "Update Todo", "PUT", f"todos/{todo_id}", 200, update_data
        )
        if not success:
            return False
        
        print(f"   Updated todo completed: {updated_todo.get('completed')}")
        
        # Delete todo
        success, _ = self.run_test(
            "Delete Todo", "DELETE", f"todos/{todo_id}", 200
        )
        return success

    def test_focus_session_flow(self):
        """Test focus session start and end"""
        # Start session
        start_data = {"duration_minutes": 1}
        success, session_data = self.run_test(
            "Start Focus Session", "POST", "focus/start", 200, start_data
        )
        if not success:
            return False
        
        session_id = session_data.get('session_id')
        print(f"   Started session: {session_id}")
        
        # End session
        end_data = {"actual_minutes": 1, "double_credits": False}
        success, end_result = self.run_test(
            "End Focus Session", "POST", f"focus/end/{session_id}", 200, end_data
        )
        if success:
            print(f"   Credits earned: {end_result.get('credits_earned', 0)}")
        
        return success

    def test_user_stats(self):
        """Test user stats endpoint"""
        success, response = self.run_test(
            "User Stats",
            "GET",
            "user/stats",
            200
        )
        if success:
            print(f"   Total sessions: {response.get('total_sessions', 0)}")
            print(f"   Focus minutes: {response.get('total_focus_minutes', 0)}")
        return success

    def cleanup_test_data(self):
        """Clean up test data from MongoDB"""
        print(f"\n🧹 Cleaning up test data...")
        
        cleanup_script = f"""
use('test_database');
db.users.deleteMany({{user_id: '{self.user_id}'}});
db.user_sessions.deleteMany({{user_id: '{self.user_id}'}});
db.todos.deleteMany({{user_id: '{self.user_id}'}});
db.focus_sessions.deleteMany({{user_id: '{self.user_id}'}});
print('✅ Test data cleaned up');
"""
        
        try:
            subprocess.run(['mongosh', '--eval', cleanup_script], 
                          capture_output=True, text=True)
            print("✅ Test data cleaned up")
        except Exception as e:
            print(f"⚠️  Cleanup warning: {str(e)}")

def main():
    print("🚀 Starting PoncikFocus API Tests")
    print("=" * 50)
    
    tester = PoncikFocusAPITester()
    
    # Create test user and session
    if not tester.create_test_user_session():
        print("❌ Cannot proceed without test user")
        return 1
    
    # Test root endpoint (no auth required)
    tester.test_root_endpoint()
    
    # Test authenticated endpoints
    test_functions = [
        tester.test_auth_me,
        tester.test_shop_items,
        tester.test_music_tracks,
        tester.test_badges,
        tester.test_todos_crud,
        tester.test_focus_session_flow,
        tester.test_user_stats,
    ]
    
    for test_func in test_functions:
        try:
            test_func()
            time.sleep(0.5)  # Small delay between tests
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
    
    # Cleanup
    tester.cleanup_test_data()
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Tests Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"🎯 Success Rate: {success_rate:.1f}%")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())