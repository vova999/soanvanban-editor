# UniKey character mapping data

`components/vietnamese-mappings/tables.json` contains the first 186 character positions from UniKey's Unicode, TCVN3, VNI-WIN, VPS and VISCII tables, transcribed to JSON. The JavaScript conversion and OOXML integration are soanvanban.com implementations.

Copyright 1998–2002 Pham Kim Long <unikey@gmail.com>.
SPDX-License-Identifier: GPL-2.0-or-later.

Source: https://github.com/fcitx/fcitx5-unikey/blob/ed9170c35c1a6275d105e03d7f9bc4f674c1469c/unikey/data.cpp
Original project and converter: https://www.unikey.org/source.html

The source contains duplicate case slots for TCVN3; normal-font decoding selects the lowercase slot and uppercase-font decoding applies uppercase. VNI-WIN sequences store the first byte in the low byte of each table value. The supplementary Western-symbol rows are excluded: ordinary punctuation is preserved unless its code is a Vietnamese letter in the selected encoding. See the accompanying GPL-2.0-or-later license text. No upstream font binaries are included.
