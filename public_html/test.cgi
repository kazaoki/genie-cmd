#!/usr/bin/perl

print "Content-type: text/html\n\n";
print "<pre style=\"border:solid 1px #888\">";
print `perl -V`;
print "</pre>";

exit;
