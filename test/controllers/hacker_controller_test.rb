require 'test_helper'

class HackerControllerTest < ActionDispatch::IntegrationTest
  test "should get index" do
    get hacker_index_url
    assert_response :success
  end

end
