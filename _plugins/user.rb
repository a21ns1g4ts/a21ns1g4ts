class User
  attr_accessor :data

  def initialize(data)
    @data = data
  end

  def to_liquid
    @data
  end
end
