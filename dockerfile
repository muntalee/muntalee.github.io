# jekyll container from ruby alphine image

# ruby 2.5.x >
FROM ruby:2.7-alphine3.15

# add jekyll dependencies
RUN apk update
RUN apt add --no-cache build-base gcc cmake git 

# ruby bundler and jekyll
RUN gem update bundler && gem install bundler jekyll