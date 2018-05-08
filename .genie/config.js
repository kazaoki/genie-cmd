
const config = module.exports.config = {}; // この行は削除や変更をしないように！

/**
 * genie設定ファイル
 * =============================================================================
 */

/**
 * genie本体設定
 * -----------------------------------------------------------------------------
 */
config.core =
{
	// 使用する Docker イメージ情報
	docker: {
		image: 'kazaoki/genie:node',
		// image: 'kazaoki/genie:node',
		// machine: 'sandbox',
		// name: 'genie-xxx',
		name: 'genie-test',
		// options: '--cpuset-cpus=0-1',
		hosts: [
			'genie-xxx.com:127.0.0.1',
		],
		// ip_force: '192.168.99.100',
		volumes: [ // ホスト側(左側)を/以外で始めるとホームパスからの指定になります。
			// 'app:/app',
			// 'home-data:/home/xxx/',
			// 'emls:/sendlog/emls',
		],
		// network: 'my_docker_nw',
	},

	// up時/down時のメッセージ表示
	memo: {
		up: [
			{info: '起動します。'},
			{warning: '開発版です'},
		],
		down: [{success: '終了します。'}],
	},
	// memo_up: {info: 'いつもお疲れ様です。'},
	// memo_down: {success: 'お疲れ様でした。'},

	// 音声スピーチの有効/無効
	enable_say: true,

	// 追加コマンド設定（実行中のコンテナ内で実行されます）
	add_command: {
		// htop => 'htop',
		// ll => 'ls -la',
	},
}

/**
 * 言語設定
 * -----------------------------------------------------------------------------
 */
config.lang =
{
	// Perl設定
	perl: {
		// version: '5.12.0', // `genie langver --perl` でリストアップされるバージョン文字列を指定
		// cpanfile_enabled: true,
	},

	// PHP設定
	php: {
		// version: '5.3.3', // `genie langver --php` でリストアップされるバージョン文字列を指定
		// configure: '--with-apxs2=/usr/bin/apxs', // `うまくいかないときは '--with-apxs2=/usr/bin/apxs --disable-fpm' など
	},

	// Ruby設定
	ruby: {
		// version: '2.3.0', // `genie langver --ruby` でリストアップされるバージョン文字列を指定
	},

	// Node.js設定
	node: {
		// version: '6.5.0', // `genie langver --node` でリストアップされるバージョン文字列を指定
	},
}

/**
 * ログ設定
 * -----------------------------------------------------------------------------
 */
config.log =
{
	// ファイルログ監視
	logs: {
		files: [
			// '/var/log/httpd/access_log',
			'/var/log/httpd/error_log',
			// '/var/log/httpd/ssl_access_log',
			// '/var/log/httpd/ssl_request_log',
			'/var/log/httpd/ssl_error_log',
			// '/var/log/nginx/access.log',
			// '/var/log/nginx/error.log',
		],
		split: 2,
	},

	// Fluentd設定（サービスログ）
	fluentd: {
		config_file: '/etc/td-agent/td-agent.conf',
	},
}

/**
 * http設定
 * -----------------------------------------------------------------------------
 */
config.http =
{
	// ブラウザ設定
	browser: {
		open_at_upped: 1, // UP時にブラウザオープンするか
		open_in_port: 80, // ブラウザで開きたい内部ポートを指定（自動的に外部ポートに変換されます）
		open_schema: 'http',
		open_path: '',
	},

	// Apache設定
	apache: {
		public_dir: 'public_html',
		no_log_regex: '\.(gif|jpg|jpeg|jpe|png|css|js|ico)$',
		real_ip_log_enabled: false,
		external_http_port: 80,
		external_https_port: 443,
	},

	// Nginx設定
	// nginx: {
	// 	public_dir: 'public_html',
	// 	external_http_port: 80,
	// 	external_https_port: 443,
	// },

	// ngrok設定
	ngrok: {
		args: 'http 80',
		authtoken: '',
		subdomain: '',
		basic_user: '',
		basic_pass: '',
	},
}

/**
 * DB設定（DB名ごとに別コンテナとして起動します）
 * -----------------------------------------------------------------------------
 */
config.db =
{
	// MySQL設定
	mysql: {
		main: {
			repository : 'mysql:5.5',
			host       : 'main.mysql-server',
			name       : 'sample_db',
			user       : 'sample_user',
			pass       : '123456789',
			charset    : 'utf8mb4',
			collation  : 'utf8mb4_unicode_ci',
			dump_genel : 3,
			// volume_lock: true,
			// external_port: 3306
		},
		sub: {
			repository : 'mysql:5.5',
			host       : 'sub.mysql-server',
			name       : 'sample_db',
			user       : 'sample_user',
			pass       : '123456789',
			charset    : 'utf8mb4',
			collation  : 'utf8mb4_unicode_ci',
			dump_genel : 3,
			volume_lock: true,
			// external_port: 3306
		},
	},

	// PostgreSQL設定
	// ※locale には ja_JP.UTF-8 | ja_JP.EUC-JP が指定可能で、encoding はこれにより自動的に設定されます。
	postgresql: {
		main: {
			repository : 'postgres:9.4',
			host       : 'main.postgresql-server',
			name       : 'sample_db',
			user       : 'sample_user',
			pass       : '123456789',
			locale     : 'ja_JP.UTF-8',
			dump_genel : 3,
			// volume_lock: true,
			// external_port: 5432
		},
		sub: {
			repository : 'postgres:9.4',
			host       : 'sub.postgresql-server',
			name       : 'sample_db',
			user       : 'sample_user',
			pass       : '123456789',
			locale     : 'ja_JP.UTF-8',
			dump_genel : 3,
			// volume_lock: true,
			// external_port: 5432
		},
	},
}

/**
 * メール設定
 * -----------------------------------------------------------------------------
 */
config.mail =
{
	// Postfix設定
	postfix: {
		// enabled: true,
		force_envelope: 'test@xx.xx',
	},

	// Sendlog設定
	sendlog: {
		// hide_desc: 1, // 一覧ページ上部の説明文を表示する(1)か否か
		external_port: 9981
	},
}

/**
 * データ転送設定
 * -----------------------------------------------------------------------------
 */
config.trans =
{
	// dlsync設定
	dlsync: {
		remote_host: '', // ポート指定したい場合は `(ホスト):(ポート)` のように指定可能です。
		remote_user: '',
		remote_pass: '',
		remote_dir: '/public_html',
		local_dir: 'public_html', // ホームパスからの相対です
		// remote_charset: 'utf8', // utf8, sjis 等
		// local_charset: 'sjis',
		lftp_option: '--verbose --delete -X .genie -X .git*', // mirror時のオプション（http://lftp.yar.ru/lftp-man.html）
		default_argv: '', // `genie dlsync`の引数が無い時の引数を指定できます。
	},

	// sshd設定
	sshd: {
		// enabled: true,
		login_user: 'genie',
		login_pass: '123456789',
		login_path: '/mnt/host',
		external_port: 22
	},
}

// /**
//  * CI設定
//  * -----------------------------------------------------------------------------
//  */
// config.ci =
// {
// 	// SPEC設定
// 	spec: {
// 		default_capture_width: 1280,
// 		default_user_agent   : '',
// 		js_errors            : 0,
// 		silent_fast          : 1,  // 1にするとfastモード時に実行するか否か聞いてこないように
// 		no_sendmail          : 1,  // 1にするとSPEC中はメール送信を行いません。（但し、/sendlogには記録されます）
// 	},

// 	// ZAP設定
// 	zap: {
// 		no_sendmail          : 1,  // 1にするとZAP中はメール送信を行いません。（但し、/sendlogには記録されます）
// 	},
// }
