# Official stable Euro-Office ARM64 release, pinned to its registry manifest.
FROM ghcr.io/euro-office/documentserver:v9.3.4-hotfix.1@sha256:a9e94372e01084b478365b291857f7ded2945d572776f0886dc0d61bd156fad1
# Supported theme build from the exact release's web-apps component.
RUN rm -rf /var/www/euro-office/documentserver/web-apps
COPY built/web-apps/ /var/www/euro-office/documentserver/web-apps/
COPY preserved-fonts.tar /tmp/preserved-fonts.tar
RUN tar -xf /tmp/preserved-fonts.tar -C /usr/share/fonts/truetype && rm /tmp/preserved-fonts.tar && fc-cache -f && /usr/bin/documentserver-generate-allfonts.sh
RUN hash=$(md5sum /var/www/euro-office/documentserver/web-apps/apps/documenteditor/main/app.js | cut -d' ' -f1) && printf 'set $cache_tag "%s";\n' "$hash" > /etc/nginx/includes/ds-cache.conf
COPY LICENSE ATTRIBUTION /usr/share/doc/soanvanban-euro-office/
LABEL org.opencontainers.image.title="Soạn Văn Bản editor" \
      org.opencontainers.image.version="9.3.4-hotfix.1-svb-theme.8-branding-local" \
      org.opencontainers.image.source="https://github.com/Euro-Office/DocumentServer/tree/v9.3.4-hotfix.1" \
      org.opencontainers.image.licenses="AGPL-3.0-only"
