FROM ubuntu:16.04

RUN useradd -ms /bin/bash indy

# Install environment
RUN apt-get update -y && apt-get install -y \
	wget \
	python3.5 \
	python3-pip \
	python-setuptools \
	ipython \
	ipython-notebook \
	apt-transport-https \
	ca-certificates \
	software-properties-common

WORKDIR /home/indy

COPY python /home/indy/python
COPY ./app /home/indy/app
RUN chmod -R 777 /home/indy/python
RUN chmod -R 777 /home/indy/app

RUN pip3 install -U \
	pip \
	setuptools \
	python3-indy gunicorn falcon

RUN apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 68DB5E88 \
    && add-apt-repository "deb https://repo.sovrin.org/sdk/deb xenial master" \
    && apt-get update \
    && apt-get install -y \
    libindy

USER indy

EXPOSE 8888
EXPOSE 8989 