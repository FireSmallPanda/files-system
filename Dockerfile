FROM hub.c.163.com/netease_comb/debian:7.9 AS BUILD
#FROM docker-lh.fpi-inc.site/fpi/node:9.11.2-local AS BUILD
LABEL maintainer="lingweihao<1020529941@qq.com>"
RUN npm install && \
    npm run start && \
