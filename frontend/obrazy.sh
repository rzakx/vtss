rm /var/www/vtss/frontend/dist/img/awatary -rf
rm /var/www/vtss/frontend/dist/img/trasy -rf
rm /var/www/vtss/frontend/dist/img/osiagniecia -rf
rm /var/www/vtss/frontend/dist/img/zdjmiesiaca -rf
ln -s /var/www/vtss/backend/awatary /var/www/vtss/frontend/dist/img/awatary
ln -s /var/www/vtss/backend/trasy /var/www/vtss/frontend/dist/img/trasy
ln -s /var/www/vtss/backend/osiagniecia /var/www/vtss/frontend/dist/img/osiagniecia
ln -s /var/www/vtss/backend/zdjmiesiaca /var/www/vtss/frontend/dist/img/zdjmiesiaca