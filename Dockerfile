FROM alpine:latest
RUN apk update && apk add git
CMD ["sleep", "1d"]