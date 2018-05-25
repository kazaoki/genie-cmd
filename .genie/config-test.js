
/**
 * genie設定をtest用に上書き
 * =============================================================================
 * DBやsendlogは external_port をすべて無効にする
 */

config.core.docker.name += '-TEST'
config.core.docker.mount_mode = 'copy'
config.core.memo = undefined
config.lang.php.error_report = false
config.log.fluentd = undefined
config.http.apache.external_http_port = undefined
config.http.apache.external_https_port = undefined
config.mail.postfix.enabled = false
config.db.mysql.main.external_port = undefined
config.db.mysql.sub.external_port = undefined
config.db.postgresql.main.external_port = undefined
config.db.postgresql.sub.external_port = undefined
config.mail.sendlog.external_port = undefined
