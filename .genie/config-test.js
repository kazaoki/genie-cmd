
/**
 * genie設定をtest用に上書き
 * =============================================================================
 * DBやsendlogは external_port をすべて無効にする
 */

config.core.docker.name += '-TEST'
config.core.docker.mount_mode = 'copy'
config.core.memo = null
config.lang.php.error_report = false
// config.log = fluentd: null
config.http.apache.external_http_port = 'auto'
config.http.apache.external_https_port = 'auto'
config.mail.postfix.enabled = false
