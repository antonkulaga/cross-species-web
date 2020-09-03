FROM quay.io/comp-bio-aging/base

RUN echo 'debconf debconf/frontend select Noninteractive' | debconf-set-selections
RUN your_command_that_install_without_sudo

RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -

#install NODEJS
RUN apt install -y nodejs
RUN apt install -y nodejs


#install yarn
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg |  apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt update && apt install -y --no-install-recommends yarn


#copy files
RUN mkdir /opt/cross-species-web
COPY ./ /opt/cross-species-web/
WORKDIR /opt/cross-species-web

#install dependencies
RUN yarn install

EXPOSE 8081
#default command
CMD yarn run dev