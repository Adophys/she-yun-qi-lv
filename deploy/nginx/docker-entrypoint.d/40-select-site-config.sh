#!/bin/sh
set -e

CONFIG="${NGINX_SITE_CONFIG:-http}"

cp "/etc/nginx/templates/${CONFIG}.conf" /etc/nginx/conf.d/default.conf
rm -f /etc/nginx/templates/*.conf
