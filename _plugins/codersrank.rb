require 'uri'
require 'net/http'


module CodersRank
  class Generator < Jekyll::Generator
    def generate(site)
      uri = URI('https://api.codersrank.io/v2/users/'+site.config['codersrank_username']+'?get_by=username')
      user = User.new(JSON.parse(Net::HTTP.get_response(uri).body))
      site.config['user'] = user
    end
  end
end
