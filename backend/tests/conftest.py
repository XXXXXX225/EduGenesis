import os
import pytest
import app.db

# Overwrite DB_PATH to use a test database
TEST_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "users_test.db")
app.db.DB_PATH = TEST_DB_PATH

@pytest.fixture(scope="session", autouse=True)
def init_test_db():
    # Initialize the test database
    app.db.init_db()
    yield
    # Clean up the test database file after all tests finish
    if os.path.exists(TEST_DB_PATH):
        # We need to make sure connections are closed
        import gc
        gc.collect()
        try:
            os.remove(TEST_DB_PATH)
        except Exception as e:
            print(f"Failed to remove test database: {e}")
